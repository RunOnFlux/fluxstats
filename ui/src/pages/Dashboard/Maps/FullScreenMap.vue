<template>
  <div
    id="map"
    class="full-screen-map"
  />
</template>
<script>
import { Loader, LoaderOptions } from 'google-maps';
import { API_KEY } from './API_KEY';

const loader = new Loader(API_KEY);

export default {
  mounted() {
    loader.load().then((google) => {
      // Regular Map
      const myLatlng = new window.google.maps.LatLng(40.748817, -73.985428);
      const mapOptions = {
        zoom: 8,
        center: myLatlng,
        scrollwheel: false, // we disable de scroll over the map, it is a really annoing when you scroll through page
      };

      const map = new window.google.maps.Map(document.getElementById('map'), mapOptions);

      const marker = new window.google.maps.Marker({
        position: myLatlng,
        title: 'Regular Map!',
      });

      marker.setMap(map);
    });
  },
};
</script>
<style>
#map {
  height: 100vh;
}
</style>
