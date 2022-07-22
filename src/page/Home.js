import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { Cookies } from "react-cookie";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { DateObject,Calendar } from "react-multi-date-picker";
import styled, {keyframes} from 'styled-components';
import { apis } from "../store/api";

import Modal from "../elements/Modal";
import MapContainer from "./MapContainer";
import SearchAddress from "./SearchAddress";
import icon_star from '../assets/img/icon_star.png';
import StyledButton from "../elements/StyledButton";


function Home() {
	const datepickerRef = useRef();
	const today = new DateObject();
	const cookies = new Cookies();
	const queryClient = useQueryClient();
	const filterAreaRef = useRef();
	const [date, setDate] = useState(new Date());
	const [dates, setDates] = useState([]);
	const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
	const [addressInfo, setAddressInfo] = useState();
	const [address, setAddress] = useState();
	const [iframeDisplay, setIframeDisplay] = useState(false);
	const categories = ['산책', '훈련', '데이케어', '1박케어', '목욕 및 모발관리'];
  const [queriesData, setQueriesData] = useState({});
	const [category, setCategory] = useState([]);
	const [searched, setSearched] = useState(false);
	const [sitters, setSitters] = useState(null);
	const [currentPosition, setCurrentPosition] = useState();
	const [defaultSearch, setDefaultSearch] = useState(false);
	const [viewType, setViewType] = useState('list');
	const [locationItems, setLocationItems] = useState();
	const [mapHeight, setMapHeight] = useState();
	const getLocationButtonRef = useRef();
	const [datepickerDisplay, setDatepickerDisplay] = useState(false);
	const [modalDisplay, setModalDisplay] = useState(false);
	const showModal = useRef(false);
	const datesTransformed= useRef(null);
	const [sitterCardShow, setSitterCardShow] = useState({display: false, index: null});
	const categoryClicked = useRef(false);
	const showTooltip = useRef(0);

	const getSittersList = (queriesData, category) => {
		const _queriesData = {...queriesData, category: category.length ? category : []};
		return apis.getSittersList(_queriesData);
	};
	const {data: sittersFilteredSearch, isLoading: sittersFilteredIsLoading, isFetched: sittersFilteredIsFetched, isRefetching: sittersAfterIsRefetching, refetch: refetchSittersAfter} = useQuery(
		["sitter_list", queriesData, category],
		() => getSittersList(queriesData, category),
		{
			onSuccess: (data) => {
				console.log('sitter_list', data)
				setSearched(false);
				setSitters(data.data.sitters);
			},
			onError: (data) => {
				console.error(data);
				setSearched(false);
			},
			enabled: !!searched,
			staleTime: Infinity,
		},
	);
	const setDatesFormat = () => {
		if (date.length > 0) {
			datesTransformed.current = null;
			const getDates = date.map((v,i) => {
				return v.format(v._format);
			});
			setDates(getDates);
			const dateItem = `${date[0].month.number < 10 ? '0' + date[0].month.number : date[0].month.number}. ${date[0].day} (${weekDays[date[0].weekDay.index]})`;
			datesTransformed.current = dateItem;
			if(date.length > 1){
				datesTransformed.current = `${dateItem} 외 ${date.length-1}일`
			}
		}
	}
	useEffect(()=>{
		console.log(dates, addressInfo)
		if(dates.length && addressInfo){
			setQueriesData({searchDate: dates, region_2depth_name: addressInfo.region_2depth_name, x: addressInfo.x, y: addressInfo.y})
		}
		showTooltip.current++;
	}, [dates, addressInfo])

	// 로그인 여부 확인하는 api
	const { mutate: checkUser } = useMutation(()=>apis.checkUser(), { 
		onSuccess: (data) => {
			console.log(data, 'auth api 성공!!!');
			localStorage.setItem('userName', data.data.user.userName);
			localStorage.setItem('userEmail', data.data.user.userEmail);
		},
		onError: (data) => {
			console.log(data, 'auth api 실패');
			localStorage.removeItem('accessToken');
			localStorage.removeItem('userName');
			localStorage.removeItem('userEmail');
		},
		staleTime: Infinity,
	});
	
	const getListApi = (currentPosition, category) =>{
		return apis.getSittersDefault({...currentPosition, category});
	}
	const {data: sittersBeforeSearch, isLoading: sittersIsLoading, isFetched: sittersIsFetched, refetch: refetchSitters, isRefetching: sittersIsRefetching} = useQuery(
		["sitter_default", currentPosition, category], () => getListApi(currentPosition, category),
		{
			onSuccess: (data) => {
				console.log('sitter_default', data)
				queryClient.invalidateQueries('sitter_default');
				setDefaultSearch(false);
				setSitters(data.data.sitter);
			},
			onError: (data) => {
				console.error(data);
				setDefaultSearch(false);
			},
			enabled: !!defaultSearch,
			staleTime: Infinity,
			refetchOnMount: 'always'
		},
	);
	const kakaoLoginApi = (dataToSend) => {
    return apis.kakaoLogin(dataToSend);
  }
  const {mutate: kakaoLoginQuery} = useMutation((dataToSend)=>kakaoLoginApi(dataToSend), {
    onSuccess: (data) => {
      console.log(data, 'success');
      localStorage.setItem('accessToken', data.data.token);
    },
    onError: (data) => {
      console.log(data, 'failed');
    },
  })
  const getKakaoProfile = async () => {
    try {
      // Kakao SDK API를 이용해 사용자 정보 획득
      let data = await window.Kakao.API.request({
        url: "/v2/user/me",
      });
      // 사용자 정보 변수에 저장
      const dataToSend = {
        userEmail: data.kakao_account.email,
        userName: data.properties.nickname,
      };
      kakaoLoginQuery(dataToSend);
    } catch (err) {
      console.log(err);
    }
  };
	const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
					const latitude = pos.coords.latitude;
					const longitude = pos.coords.longitude;
					setCurrentPosition({x: longitude, y: latitude});
					setDefaultSearch(true);
        },
        (error) => {
					console.log(error)
          console.error(error);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: Infinity,
        }
      );
    } else {
      alert('GPS를 허용해주세요');
    }
  };

	useEffect(()=>{
		if(localStorage.getItem('kakaoToken')){
			getKakaoProfile();
		}
		getLocationButtonRef.current.click();
		const fullHeight = window.innerHeight;
		const filterHeight = filterAreaRef.current.clientHeight;
		setMapHeight(fullHeight - filterHeight - 74);
		showTooltip.current++;
	},[])

	useEffect(()=>{
		if(categoryClicked.current){
			if(addressInfo &&  dates?.length > 0){
				console.log('검색 후 categorizing');
				refetchSittersAfter();
			}else{
				console.log('검색 전 categorizing');
				refetchSitters();
			} 
		}
		categoryClicked.current = false;
	},[category])
	
	useEffect(()=>{
		if(dates.length && addressInfo){
			setQueriesData({searchDate: dates, region_2depth_name: addressInfo.region_2depth_name, x: addressInfo.x, y: addressInfo.y, category});
			setSearched(true);
		}
		showTooltip.current++;
	}, [dates, addressInfo])

	useEffect(()=>{
		if(sitters?.length > 0){
			// 가격에 쉼표 추가
			for(let i=0; i<sitters.length; i++){
				const priceString = String(sitters[i].servicePrice);
				sitters[i].servicePrice = priceString.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
			}
			// 카카오맵에 전달할 위도,경도 정보 저장
			setLocationItems(()=>{
				const positionItems = [];
				sitters.map((v,i)=>{
					const obj = {x: v.location.coordinates[0], y: v.location.coordinates[1], sitterName: v.sitterName ? v.sitterName : '돌보미', averageStar: v.averageStar, index: i};
					positionItems.push(obj);
				})
				return positionItems;
			})
		}
	},[sitters, sittersIsRefetching])

	useEffect(() => {
		if(localStorage.getItem('accessToken')){
			checkUser();
		}else{
			console.log('액세스 토큰 없음')
		}
		return()=>{
			setSitters(null);
		}
	}, []);

	if (sittersFilteredIsLoading) return null;
	return (
		<>
		<div className="home" style={{position: 'relative'}}>
			<button type="button" onClick={getLocation} ref={getLocationButtonRef} style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0}}></button>
			<IndexPage>
				<FilterArea ref={filterAreaRef}>
					<div className="searchWrap" style={{position: 'relative'}}>
						<div style={{position: 'relative'}}>
							<div className="inputBox">
								<input type="text" placeholder="구, 동을 검색해주세요. (예: 강남구 논현동)" value={addressInfo?.address_name && addressInfo?.address_name} onClick={()=>{setIframeDisplay(true); setDatepickerDisplay(false)}} readOnly/>
								<i className="ic-search"></i>
							</div>
							{
								iframeDisplay && (
									<AddressWrap style={{margin: '0 -1px'}}>
										<SearchAddress setAddressInfo={setAddressInfo} iframeDisplay={iframeDisplay} setIframeDisplay={setIframeDisplay}/>
										<StyledButton _title="닫기" _margin="0" _onClick={()=>setIframeDisplay(false)}/>
									</AddressWrap>
								)
							}
						</div>
						<div style={{position: 'relative', zIndex: 2}}>
							<div className="inputBox date">
								<input type="text" placeholder="날짜를 선택해주세요." value={datesTransformed.current?.length > 0 ? datesTransformed.current : ''} onClick={()=>{setDatepickerDisplay(true); setIframeDisplay(false)}} readOnly/>
								<i className="ic-calendar"></i>
							</div>
							<DatepickerWrap style={{display: datepickerDisplay === true ? 'block' : 'none', position: 'absolute', left: '-1px', right: '-1px', top: '100%'}}>
								<Calendar
									ref={datepickerRef}
									onChange={setDate}
									multiple={true}
									format="YYYY/MM/DD"
									minDate={new Date()}
									maxDate={new Date(today.year + 1, today.month.number, today.day)}
									shadow={false}
									weekDays={weekDays}
									months={months}
									style={{
										borderRadius: 0,
									}}
								/>
								<StyledButton _title="날짜 적용" _margin="0" _onClick={()=>{setDatepickerDisplay(false); setDatesFormat()}}/>
							</DatepickerWrap>
						</div>
						{/* <Tooltip className={showTooltip.current === 0 ? 'aniClass' : ''}>장소와 날짜 모두 선택해주세요.</Tooltip> */}
					</div>
					<Categories>
						<ul>
						{categories.map((v, i) => {
							return (
								<li key={i}>
									<label>
										<input type="checkbox" onChange={(e) => {
											showTooltip.current = 1;
											categoryClicked.current = true;
											if(categoryClicked.current){
												if(e.target.checked){ 
													setCategory((prev)=>{
														const new_category = [...prev];
														new_category.push(v);
														return new_category;
													})
												}else{
													setCategory((prev)=>{
														const new_category = [...prev];
														return new_category.filter(item=>{
															return item !== v;
														})
													})
												}
											}
										}}/>
										<span>{v}</span>
									</label>
								</li>
							);
						})}
						</ul>
					</Categories>
				</FilterArea>
				<SittersListArea>
					{
						sitters?.length > 0 ? (
							<>
							{
								(viewType === 'list')
								? (
								<ul>
									{
										sitters?.map((v,i)=>{
											return (
												<SitterCard key={`sitter_${i}`}>
													<Link to={`/detail/${v.sitterId}`}>
													<div className="image_area" style={{backgroundImage: `url(${v.mainImageUrl})`}}>
														<span className="sitter_image" style={{backgroundImage: `url(${v.imageUrl})`}}></span>
													</div>
													<div className="info_area">
														<p className="sitter">
															<em>{v.sitterName}</em>
															<span>재고용률 {v.rehireRate}%</span>
														</p>
														<p className="address">{v.address}</p>
														<div className="bottom_info">
															<div className="star">
																<img src={icon_star} alt="star"/>
																<span>{v.averageStar} </span>
																<span>{`(${v.reviewCount})`}</span>
															</div>
															<p className="price"><strong>{v.servicePrice}</strong><span>원~</span></p>
														</div>
													</div>
													</Link>
												</SitterCard>
											)
										})
									}
								</ul>
								) : (
									<MapArea>
										<MapContainer items={locationItems} _height={mapHeight} setSitterCardShow={setSitterCardShow}/>
										{
											<ul style={{background: 'transparent'}}>
												{
													sitterCardShow.display && (
														<SitterCard style={{background: '#fff'}}>
															<Link to={`/detail/${sitters[sitterCardShow.index].sitterId}`}>
															<div className="image_area" style={{backgroundImage: `url(${sitters[sitterCardShow.index].mainImageUrl})`}}>
																<span className="sitter_image" style={{backgroundImage: `url(${sitters[sitterCardShow.index].imageUrl})`}}></span>
															</div>
															<div className="info_area">
																<p className="sitter">
																	<em>{sitters[sitterCardShow.index].sitterName}</em>
																	<span>재고용률 {sitters[sitterCardShow.index].rehireRate}%</span>
																</p>
																<p className="address">{sitters[sitterCardShow.index].address}</p>
																<div className="bottom_info">
																	<div className="star">
																		<img src={icon_star} alt="star"/>
																		<span>{sitters[sitterCardShow.index].averageStar} </span>
																		<span>{`(${sitters[sitterCardShow.index].reviewCount})`}</span>
																	</div>
																	<p className="price"><strong>{sitters[sitterCardShow.index].servicePrice}</strong><span>원~</span></p>
																</div>
															</div>
															</Link>
															<button type="button" className="closeSitterCard" onClick={()=>setSitterCardShow({display: false, index: null})}>닫기</button>
														</SitterCard>
													)
												}
											</ul>
										}
									</MapArea>
								)
							}
							</>
						) : (
							<>
								{
									(sitters?.length <= 0 ) && <p>검색된 돌보미가 없습니다.</p>
								}
							</>
						)
					}
					
				</SittersListArea>
				<Buttons>
					{
						sitters?.length > 0 && (
							viewType === 'list' ? (
								<button type="button" className="showMapView" onClick={()=>setViewType('map')}><i className="ic-map"></i>지도</button>
							) : (
								<button type="button" className="showListView" onClick={()=>setViewType('list')}><i className="ic-list"></i>리스트</button>
							)
						)
					}
				</Buttons>
			</IndexPage>
		</div>
		<Modal _alert={true} _display={modalDisplay} confirmOnClick={()=>setModalDisplay(false)}>
			<div className="text_area">
				<p>장소와 날짜를 모두 선택해주세요.</p>
			</div>
		</Modal>
		</>
	);
}

const IndexPage = styled.div`
.rmdp-container{
	max-width: 100%;
	width: 100%;
	.rmdp-input{
		display: block;
		width: 100%;
		height: 46px;
		line-height: 46px;
		border-radius: 0;
		border: 1px solid #999;
		&:focus{
			box-shadow: none;
		}
	}
}
`
const DatepickerWrap = styled.div`
`
const Buttons = styled.div`
	position: fixed;
	width: 100%;
	bottom: 44px;
	text-align: center;
	pointer-events: none;
	left: 0;
	right: 0;
	z-index: 2;
	@media (min-width: 768px){
		max-width: 412px;
		right: 10%;
		left: auto;
	}
	button{
		position: absolute;
		bottom: 30px;
		left: 50%;
		bottom: 30px;
		transform: translateX(-50%);
		pointer-events: all;
		display: inline-block;
		line-height: 40px;
		height: 40px;
		padding: 0 16px;
		font-size: 16px;
		color: #1a1a1a;
		background: #FFFFFF;
		box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(120,120,120,.2);
		border-radius: 20px;
		i{
			display: inline-block;
			vertical-align: middle;
			margin: -2px 5px 0 0;
			color: #FC9215;
		}
		&.showMapView{
			i{
				font-size: 20px;
				margin-top: -4px;
			}
		}
		&.showListView{
			i{
				font-size: 13px;
				margin-right: 7px;
			}
		}
}
`
const FilterArea = styled.div`
.searchWrap{
	z-index: 2;
}
.inputBox{
	position: relative;
	input{
		display: block;
		width: 100%;
		height: 48px;
		padding: 0 15px 0 44px;
		border-radius: 6px;
		border: 1px solid rgba(120,120,120,.4);
		box-sizing: border-box;
			font-size: 16px;
		&::placeholder{
			color: rgba(120, 120, 120, 0.7);
		}
	}
	i{
		position: absolute;
		left: 0;
		top: 0;
		font-size: 26px;
		width: 44px;
		height: 48px;
		text-align: center;
		line-height: 48px;
		&::before{
			color: #676767;
		}
		&.ic-calendar{
			line-height: 42px;
			&::before{
				font-size: 20px;
				color: #1a1a1a;
				margin-top: -3px;
			}
		}
	}
	& + div{
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid rgba(120,120,120,.4);
		button{
			border-radius: 0;
		}
	}
	&.date{
		max-width: 51%;
		margin-top: 16px;
		input{
			padding-left: 34px;
		}
		i{
			width: 36px;
		}
	}
}
.rmdp-container {
	position: relative;
}
 .rmdp-ep-arrow{
	height: 0!important;
	 & + div{
		width: 100%;
		top: 46px!important;
		transform: translate(0,0)!important;
		z-index: 100;
	 }
 }
 .rmdp-ep-arrow[direction=top]:after{
	display: none;
 }
 .rmdp-border{
	border-radius: 0;
	border: none;
 }

`
const Categories = styled.div`
	overflow: hidden;
	overflow-x: auto;
	margin: 0 -20px;
	padding: 16px 20px 24px;
	&{-ms-overflow-style:none; }
	&::-webkit-scrollbar { display:none; }
	ul{
		display: inline-flex;
		white-space: nowrap;
		gap: 10px;
	}
	label{
		position: relative;
		input{
			position: absolute;
			left: 0;
			top: 0;
			width: 0;
			height: 0;
			& + span{
				display: inline-block;
				padding: 0 12px;
				font-size: 14px;
				color: #787878;
				height: 32px;
				line-height: 32px;
				border-radius: 16px;
				box-sizing: border-box;
				border: 1px solid rgba(120, 120, 120, 0.2);
			}
			&:checked + span{
				color: #FC9215;
				font-weight: 700;
				border: 1px solid transparent;
				background: rgba(252, 146, 21, 0.1);
			}
		}
	}
`
const SitterCard = styled.li`
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);
	&+li{
		margin-top: 16px;
	}
	.image_area{
		position: relative;
		height: 0;
		padding-bottom: 29.2397%;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		.sitter_image{
			position: absolute;
			right: 23px;
			bottom: -23px;
			width: 60px;
			height: 60px;
			border-radius: 10px;
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
		}
	}
	.info_area{
		padding: 14px 18px;
		color: #1A1A1A;
		.sitter{
			display: flex;
			align-items: center;
			gap: 10px;
			em{
				font-size: 18px;
				line-height: 1;
			}
			span{
				display: inline-block;
				background: rgba(252, 146, 21, 0.1);
				border-radius: 3px;
				padding: 0 5px;
				line-height: 18px;
				height: 16px;
				font-size: 12px;
				font-weight: 500;
				color: #FC9215;
				margin-top: -3px;
			}
		}
		.address{
			font-size: 12px;
			color: #787878;
			margin-top: 6px;
		}
		.bottom_info{
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 10px;
			.star{
				display: flex;
				align-items: center;
				font-size: 14px;
				font-weight: 500;
				img{
					display: inline-block;
					width: 13px;
					margin-top: -1px;
					margin-right: 4px;
				}
				span{
					font-weight: 500;
					& + span{
						font-weight: 400;
						margin-left: 2px;
					}
				}
			}
			.price{
				display: flex;
				align-items: center;
				font-size: 14px;
				color: #787878;
				gap: 2px;
				strong{
					color: #1A1A1A;
					font-size: 24px;
					font-weight: 700;
				}
				span{
					margin-top: 2px;
				}
			}
		}
	}
`
const SittersListArea = styled.div`
	&::before{
		display: block;
		height: 6px;
		margin: 0 -20px 20px;
		content: '';
		background-color: #F5F5F5;
	}
`
const AddressWrap = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	border: 1px solid #999;
	margin-bottom: 10px;
	z-index: 100;
`
const MapArea = styled.div`
	position: relative;
	border-radius: 10px;
	overflow: hidden;
	ul{
		position: absolute;
		left: 10px;
		right: 10px;
		top: 10px;
		z-index: 2;
		background-color: #fff;
		.closeSitterCard{
			position: absolute;
			right: 10px;
			top: 10px;
			width: 24px;
			height: 24px;
			background: rgba(0,0,0,.6);
			border-radius: 50%;
			font-size: 0;
			&::before,
			&::after{
				position: absolute;
				left: 0;
				right: 0;
				top: 50%;
				height: 1px;
				background-color: #fff;
				width: 12px;
				margin: 0 auto;
				content: '';
				transform: rotate(-45deg);
			}
			&::after{
				transform: rotate(45deg);
			}
		}
	}
`
const tooltipAnimation = keyframes`
	0%{
		opacity: 1;
	}
	95%{
		opacity: 1;
	}
	100%{
		opacity: 0;
	}
`
const Tooltip = styled.p`
	position: absolute;
	left: 0;
	top: calc(100% + 16px);
	display: inline-block;
	background-color: rgba(25,25,25,.9);
	border-radius: 6px;
	padding: 0 12px;
	line-height: 36px;
	font-size: 14px;
	color: #fff;
	animation: ${tooltipAnimation} 5s forwards;
	&:before{
		position: absolute;
		left: 50%;
		top: -9px;
		width: 0;
		height: 0;
		border: 7px solid rgba(25,25,25,.9);
		border-top: 2px solid transparent;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		content: '';
	}
`
export default Home;
