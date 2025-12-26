import { useEffect, useRef, useState } from "react";
import "./Main.css"; // 스타일은 기존 Main.css를 공유

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
    if (window.google && window.google.maps) {
      initMapOnce();
      return;
    }

    if (document.querySelector('script[data-google-maps="basic"]')) return;

    const apiKey = "AIzaSyDlFE9sx4N0f3fEUZ4XqriUusrOE3nfPPM";

    window.__initGoogleMap = () => {
      initMapOnce();
    };

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "basic");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&callback=__initGoogleMap&v=weekly&loading=async`;

    script.onerror = () => {
      setStatus("구글맵 스크립트 로드 실패(콘솔 확인)");
    };

    document.head.appendChild(script);
  }, []);

  const initMapOnce = () => {
    if (!mapDivRef.current) return;
    if (mapRef.current) return;

    const initial = { lat: 37.5665, lng: 126.978 }; // 서울 시청

    mapRef.current = new window.google.maps.Map(mapDivRef.current, {
      center: initial,
      zoom: 12,
    });

    geocoderRef.current = new window.google.maps.Geocoder();
    infoWindowRef.current = new window.google.maps.InfoWindow();

    setReady(true);
    setStatus("준비완료");
  };

  const moveToMyLocation = () => {
    if (!ready || !mapRef.current || !geocoderRef.current) return;

    setStatus("내 위치 가져오는 중...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const my = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        mapRef.current.setCenter(my);
        mapRef.current.setZoom(16);

        // 좌표 -> 주소 변환 (Reverse Geocoding)
        geocoderRef.current.geocode({ location: my }, (results, geocodeStatus) => {
          if (geocodeStatus === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            setOrMoveMarker(my, address);
            setStatus(address); // 상태를 주소로 업데이트
          } else {
            setOrMoveMarker(my, '내 위치');
            setStatus('주소를 찾을 수 없습니다.');
          }
        });
      },
      (err) => {
        setStatus("내 위치 실패: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const setOrMoveMarker = (latLngObj, titleText) => {
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: latLngObj,
        map: mapRef.current,
        title: titleText,
      });
    } else {
      markerRef.current.setPosition(latLngObj);
      markerRef.current.setTitle(titleText);
    }
  };

  const searchLocation = (searchText) => {
    if (!ready || !mapRef.current || !geocoderRef.current) return;

    const text = (typeof searchText === "string" ? searchText : query).trim();
    if (!text) {
      setStatus("검색어를 입력하세요.");
      return;
    }

    setStatus("검색 중...");
    setIsSearchMode(true);

    // 검색 시 기존 충전소 마커 숨기기
    stationMarkersRef.current.forEach((marker) => marker.setMap(null));

    geocoderRef.current.geocode({ address: text }, (results, geocodeStatus) => {
      if (geocodeStatus !== "OK" || !results || results.length === 0) {
        setStatus("검색 실패: " + geocodeStatus);
        return;
      }

      const loc = results[0].geometry.location; // LatLng 객체
      const pos = { lat: loc.lat(), lng: loc.lng() };

      mapRef.current.setCenter(pos);
      mapRef.current.setZoom(16);

      setOrMoveMarker(pos, results[0].formatted_address || text);

      setStatus("");
    });
  };

  useEffect(() => {
    if (ready && initialQuery) {
      setQuery(initialQuery);
      searchLocation(initialQuery);
    }
  }, [ready, initialQuery]);

  useEffect(() => {
    // 검색어가 비워지면 모든 충전소 마커를 다시 표시합니다.
    if (query === "" && ready) {
      setIsSearchMode(false);
      stationMarkersRef.current.forEach((marker) => {
        marker.setMap(mapRef.current);
      });
      // 검색 결과로 표시된 마커는 숨깁니다.
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      setStatus("전체 충전소 표시");
    }
  }, [query, ready]);

  useEffect(function () {
  if (!ready || !stations.length || !geocoderRef.current) return;

  // 이전 마커 제거
  stationMarkersRef.current.forEach(function (marker) {
    marker.setMap(null);
  });
  stationMarkersRef.current = [];


  // 현재 모든 충전소 마커 표시
  var geocoder = geocoderRef.current;
  stations.forEach(function (station, idx) {
  //console.log("충전소 정보", idx, station);
  
  //geocoder.geocode() 주소/장소명 문자열 → 좌표(위도/경도) 로 바꿔주는 함수
    geocoder.geocode({ address: station.name }, function (results, status) {
      if (status === "OK") {
        var location = results[0].geometry.location;
  //console.log("지오코딩 충전소 정보", results[0]);
  // 지오코딩 결과(results[0])에서 얻은 좌표(location)로 충전소 마커 생성
        var newMarker = new window.google.maps.Marker({
          position: location,
          map: isSearchModeRef.current ? null : mapRef.current,
          title: station.name,
        });
  // 표시된 마커 상세설명
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

        stationMarkersRef.current.push(newMarker);
      } else {
        console.warn("'" + station.name + "' 지오코딩 실패: " + status);
      }
    });
  });
}, [ready, stations]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      searchLocation();
    }
  };

  return (
    <>
      <div className="actions">
        <input className="actions_Input"
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
        <span>{status}</span>
      </div>

      <section className="mapWrap">
        <div className="mapBox">
          <div className="mapCanvas" ref={mapDivRef}></div>
        </div>
      </section>
    </>
  );
}

export default Google;