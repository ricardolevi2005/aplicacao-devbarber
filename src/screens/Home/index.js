import React, {useState, useEffect} from 'react';
import {Platform, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {request, PERMISSIONS} from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

import Api from '../../Api';

import {
  Container,
  Scroller,
  HeaderArea,
  HeaderTitle,
  SearchButton,
  LocationArea,
  LocationInput,
  LocationFinder,
  LoadingIcon,
  ListArea,
} from './styles';

import BarberItem from '../../components/BarberItem';

import SearchIcon from '../../assets/search.svg';
import MyLocationIcon from '../../assets/my_location.svg';

const Home = () => {
  const navigation = useNavigation();

  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const handlerLocationFinder = async () => {
    setCoords(null);
    let result = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (result === 'granted') {
      setLoading(true);
      setLocationText('');
      setList([]);

      Geolocation.getCurrentPosition(info => {
        setCoords(info.coords);
        getBarbers();
      });
    }
  };

  const getBarbers = async () => {
    setLoading(true);
    setList([]);

    let latitude = null;
    let longitude = null;

    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    let res = await Api.getBarbers(latitude, longitude, locationText);
    if (res.error === '') {
      if (res.loc) {
        setLocationText(res.loc);
      }
      setList(res.data);
    } else {
      alert('Erro: ' + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getBarbers();
  }, []);

  const onRefresh = () => {
    setRefreshing(false);
    getBarbers();
  };

  const handlerLocationSearch = () => {
    setCoords({});
    getBarbers();
  };

  return (
    <Container>
      <Scroller
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <HeaderArea>
          <HeaderTitle numberOfLines={2}>
            Encontre o seu barbeiro favorito
          </HeaderTitle>
          <SearchButton onPress={() => navigation.navigate('Search')}>
            <SearchIcon width="26" height="26" fill="#fff" />
          </SearchButton>
        </HeaderArea>

        <LocationArea>
          <LocationInput
            placeholder="Onde você está?"
            placeholderTextColor="#fff"
            value={locationText}
            onChangeText={t => setLocationText(t)}
            onEndEditing={handlerLocationSearch}
          />
          <LocationFinder onPress={handlerLocationFinder}>
            <MyLocationIcon width="24" height="24" fill="#fff" />
          </LocationFinder>
        </LocationArea>

        {loading && <LoadingIcon size="large" color="#fff" />}

        <ListArea>
          {list.map((item, key) => (
            <BarberItem key={key} data={item} />
          ))}
        </ListArea>
      </Scroller>
    </Container>
  );
};

export default Home;
