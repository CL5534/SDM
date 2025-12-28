import { useEffect, useRef, useState } from "react";
import "./Main.css";

function Google({ initialQuery, stations }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const stationMarkersRef = useRef([]);
  const geocoderRef = useRef(null);
  const infoWindowRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("지도 스크립트 로딩중...");
  const [query, setQuery] = useState(initialQuery || "");

  // 검색 모드인지 여부를 추적 (검색 결과가 표시되는 동안 충전소 마커 숨김)
  const [isSearchMode, setIsSearchMode] = useState(!!initialQuery);
  const isSearchModeRef = useRef(isSearchMode);

  useEffect(() => { isSearchModeRef.current = isSearchMode; }, [isSearchMode]);

  useEffect(() => {
    // 이미 구글맵이 로드되어 있으면 바로 지도 초기화
    if (window.google && window.google.maps) {
      initMapOnce();
      return;
    }

    // 동일 스크립트 중복 로딩 방지
    if (document.querySelector('script[data-google-maps="basic"]')) return;

    const apiKey = "AIzaSyDlFE9sx4N0f3fEUZ4XqriUusrOE3nfPPM";

    // 구글맵 스크립트 로드 완료 시 실행될 콜백 등록
    window.__initGoogleMap = () => {
      initMapOnce();
    };

    // 구글맵 스크립트 동적 주입
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "basic");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&callback=__initGoogleMap&v=weekly&loading=async`;

    // 스크립트 로드 실패 시 상태 문구 표시
    script.onerror = () => {
      setStatus("구글맵 스크립트 로드 실패(콘솔 확인)");
    };

    document.head.appendChild(script);
  }, []);

  const initMapOnce = () => {
    // map DOM이 없으면 종료
    if (!mapDivRef.current) return;
    // 이미 지도가 생성되어 있으면 중복 생성 방지
    if (mapRef.current) return;

    const initial = { lat: 37.5665, lng: 126.978 }; // 서울 시청

    // 구글 지도 생성(초기 중심/줌 설정)
    mapRef.current = new window.google.maps.Map(mapDivRef.current, {
      center: initial,
      zoom: 12,
    });

    // 주소↔좌표 변환용 Geocoder 준비
    geocoderRef.current = new window.google.maps.Geocoder();
    // 마커 클릭 시 정보 표시용 InfoWindow 준비
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // 지도 사용 가능 상태로 전환
    setReady(true);
    setStatus("준비완료");
  };

  const moveToMyLocation = () => {
    // 지도 준비 안 됐으면 종료
    if (!ready || !mapRef.current || !geocoderRef.current) return;

    setStatus("내 위치 가져오는 중...");

    // 브라우저 위치 권한 이용해서 현재 좌표 얻기
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const my = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        // 내 위치로 지도 이동 + 확대
        mapRef.current.setCenter(my);
        mapRef.current.setZoom(16);

        // 좌표 -> 주소 변환(Reverse Geocoding)
        geocoderRef.current.geocode({ location: my }, (results, geocodeStatus) => {
          if (geocodeStatus === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            // 내 위치 마커 찍고 제목을 주소로 표시
            setOrMoveMarker(my, address);
            // 상태 문구를 주소로 업데이트
            setStatus(address);
          } else {
            // 주소 변환 실패 시 "내 위치"로 표시
            setOrMoveMarker(my, '내 위치');
            setStatus('주소를 찾을 수 없습니다.');
          }
        });
      },
      (err) => {
        // 위치 권한 거부/오류 처리
        setStatus("내 위치 실패: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const setOrMoveMarker = (latLngObj, titleText) => {
    // 검색/내 위치용 마커가 없으면 생성
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: latLngObj,
        map: mapRef.current,
        title: titleText,
      });
    } else {
      // 이미 있으면 위치/제목만 업데이트
      markerRef.current.setPosition(latLngObj);
      markerRef.current.setTitle(titleText);
    }
  };

  const searchLocation = (searchText) => {
    // 지도 준비 안 됐으면 종료
    if (!ready || !mapRef.current || !geocoderRef.current) return;

    // 전달값이 있으면 그걸 사용, 없으면 현재 query 사용
    const text = (typeof searchText === "string" ? searchText : query).trim();
    if (!text) {
      setStatus("검색어를 입력하세요.");
      return;
    }

    setStatus("검색 중...");
    // 검색 중에는 충전소 마커 숨김 상태로 전환
    setIsSearchMode(true);

    // 검색할 때 기존 충전소 마커 전부 숨기기
    stationMarkersRef.current.forEach((marker) => marker.setMap(null));

    // 주소/장소명 -> 좌표 변환(Geocoding)
    geocoderRef.current.geocode({ address: text }, (results, geocodeStatus) => {
      if (geocodeStatus !== "OK" || !results || results.length === 0) {
        setStatus("검색 실패: " + geocodeStatus);
        return;
      }

      const loc = results[0].geometry.location;
      const pos = { lat: loc.lat(), lng: loc.lng() };

      // 검색 결과 위치로 지도 이동 + 확대
      mapRef.current.setCenter(pos);
      mapRef.current.setZoom(16);

      // 검색 결과 마커 표시
      setOrMoveMarker(pos, results[0].formatted_address || text);

      // 상태 문구 제거
      setStatus("");
    });
  };

  useEffect(() => {
    // 초기 검색어(initialQuery)가 있으면 지도 준비 후 자동 검색
    if (ready && initialQuery) {
      setQuery(initialQuery);
      searchLocation(initialQuery);
    }
  }, [ready, initialQuery]);

  useEffect(() => {
    // 검색어가 비워지면 전체 충전소 마커 다시 표시
    if (query === "" && ready) {
      setIsSearchMode(false);

      // 숨겨놨던 충전소 마커들 다시 map에 붙이기
      stationMarkersRef.current.forEach((marker) => {
        marker.setMap(mapRef.current);
      });

      // 검색 결과 마커는 숨기기
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      setStatus("전체 충전소 표시");
    }
  }, [query, ready]);

  useEffect(function () {
    // 지도 준비 + stations 존재 + geocoder 준비 안되면 종료
    if (!ready || !stations.length || !geocoderRef.current) return;

    // 이전에 찍어둔 충전소 마커 제거
    stationMarkersRef.current.forEach(function (marker) {
      marker.setMap(null);
    });
    stationMarkersRef.current = [];

    // 충전소 목록을 돌면서 주소/이름을 지오코딩 후 마커 생성
    var geocoder = geocoderRef.current;
    stations.forEach(function (station, idx) {

      // geocoder.geocode(): 문자열 주소/장소명 -> 좌표(위도/경도)
      // (현재는 station.name으로 검색 중이라 이름이 애매하면 정확도가 떨어질 수 있음)
      geocoder.geocode({ address: station.name }, function (results, status) {
        if (status === "OK") {
          var location = results[0].geometry.location;

          // 지오코딩 좌표로 충전소 마커 생성
          // 검색 모드일 때는 숨김(null), 일반 모드일 때만 표시
          var newMarker = new window.google.maps.Marker({
            position: location,
            map: isSearchModeRef.current ? null : mapRef.current,
            title: station.name,
          });

          // 마커 클릭 시 상세정보(주소/상세위치) InfoWindow로 표시
          newMarker.addListener("click", function () {
            var content = `
              <div style="padding:5px; min-width:150px; color:black;">
                <h3 style="margin:0 0 5px; font-size:16px;">${station.name}</h3>
                <p style="margin:5px 0; font-size:13px;"><strong>상세 위치:</strong> ${station.detail_location || "정보 없음"}</p>
                <p style="margin:0; font-size:12px; color:#666;">${station.address}</p>
              </div>
            `;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(mapRef.current, newMarker);
          });

          // 생성한 마커를 배열에 저장(나중에 숨김/삭제하려고)
          stationMarkersRef.current.push(newMarker);
        } else {
          // 지오코딩 실패 로그(콘솔에서 확인)
          console.warn("'" + station.name + "' 지오코딩 실패: " + status);
        }
      });
    });
  }, [ready, stations]);

  const onKeyDown = (e) => {
    // 엔터 누르면 검색 실행
    if (e.key === "Enter") {
      searchLocation();
    }
  };

  return (
    <>
      <div className="actions">
        <input
          className="actions_Input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="주소/장소명 검색 (예: 강남역)"
          disabled={!ready}
        />
        <button className="btnPrimary" type="button" onClick={searchLocation} disabled={!ready}>
          검색
        </button>

        <button className="btnGhost" type="button" onClick={moveToMyLocation} disabled={!ready}>
          내 위치
        </button>

        {/* 현재 상태 문구(로딩/주소/전체표시 등) */}
        <span>{status}</span>
      </div>

      <section className="mapWrap">
        <div className="mapBox">
          {/* 구글 지도 렌더링 영역 */}
          <div className="mapCanvas" ref={mapDivRef}></div>
        </div>
      </section>
    </>
  );
}

export default Google;
