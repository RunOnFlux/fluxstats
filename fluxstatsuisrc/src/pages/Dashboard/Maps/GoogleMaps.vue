<template>
  <div class="row">
    <div class="col-md-12">
      <card class="card-map">
        <div slot="header">
          <h4 class="card-title">Satellite Map</h4>
        </div>
        <div id="satelliteMap" class="map map-big"></div>
      </card>
    </div>
    <div class="col-md-6">
      <card class="card-map">
        <div slot="header">
          <h4 class="card-title">Regular Map</h4>
        </div>
        <div id="regularMap" class="map"></div>
      </card>
    </div>
    <div class="col-md-6">
      <card class="card-map">
        <div slot="header">
          <h4 class="card-title">Custom Skin & Settings Map</h4>
        </div>
        <div id="customSkinMap" class="map"></div>
      </card>
    </div>
  </div>
</template>
<script>
import { API_KEY } from "./API_KEY";
import { Loader, LoaderOptions } from "google-maps";

const loader = new Loader(API_KEY);

  export default {
    mounted () {
      loader.load().then(function(google) {
        // Satellite Map
        const myLatlng1 = new window.google.maps.LatLng(40.748817, -73.985428)
        const mapOptions1 = {
          zoom: 3,
          scrollwheel: false, // we disable de scroll over the map, it is a really annoing when you scroll through page
          center: myLatlng1,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE
        }

        const map1 = new window.google.maps.Map(document.getElementById('satelliteMap'), mapOptions1)

        const marker1 = new window.google.maps.Marker({
          position: myLatlng1,
          title: 'Satellite Map!'
        })
        marker1.setMap(map1)


        // Regular Map
        const myLatlng2 = new window.google.maps.LatLng(40.748817, -73.985428)
        const mapOptions2 = {
          zoom: 8,
          center: myLatlng2,
          scrollwheel: false // we disable de scroll over the map, it is a really annoing when you scroll through page
        }

        const map2 = new window.google.maps.Map(document.getElementById('regularMap'), mapOptions2)

        const marker2 = new window.google.maps.Marker({
          position: myLatlng2,
          title: 'Regular Map!'
        })

        marker2.setMap(map2)


        // Custom Skin & Settings Map
        const myLatlng3 = new google.maps.LatLng(40.748817, -73.985428)
        const mapOptions3 = {
          zoom: 13,
          center: myLatlng3,
          scrollwheel: false, // we disable de scroll over the map, it is a really annoing when you scroll through page
          disableDefaultUI: true, // a way to quickly hide all controls
          zoomControl: true,
          styles: [{
            'featureType': 'water',
            'stylers': [{'saturation': 43}, {'lightness': -11}, {'hue': '#0088ff'}]
          }, {
            'featureType': 'road',
            'elementType': 'geometry.fill',
            'stylers': [{'hue': '#ff0000'}, {'saturation': -100}, {'lightness': 99}]
          }, {
            'featureType': 'road',
            'elementType': 'geometry.stroke',
            'stylers': [{'color': '#808080'}, {'lightness': 54}]
          }, {
            'featureType': 'landscape.man_made',
            'elementType': 'geometry.fill',
            'stylers': [{'color': '#ece2d9'}]
          }, {
            'featureType': 'poi.park',
            'elementType': 'geometry.fill',
            'stylers': [{'color': '#ccdca1'}]
          }, {
            'featureType': 'road',
            'elementType': 'labels.text.fill',
            'stylers': [{'color': '#767676'}]
          }, {
            'featureType': 'road',
            'elementType': 'labels.text.stroke',
            'stylers': [{'color': '#ffffff'}]
          }, {'featureType': 'poi', 'stylers': [{'visibility': 'off'}]}, {
            'featureType': 'landscape.natural',
            'elementType': 'geometry.fill',
            'stylers': [{'visibility': 'on'}, {'color': '#b8cb93'}]
          }, {'featureType': 'poi.park', 'stylers': [{'visibility': 'on'}]}, {
            'featureType': 'poi.sports_complex',
            'stylers': [{'visibility': 'on'}]
          }, {'featureType': 'poi.medical', 'stylers': [{'visibility': 'on'}]}, {
            'featureType': 'poi.business',
            'stylers': [{'visibility': 'simplified'}]
          }]
        }

        const map3 = new google.maps.Map(document.getElementById('customSkinMap'), mapOptions3)

        const marker3 = new google.maps.Marker({
          position: myLatlng3,
          title: 'Custom Skin & Settings Map!'
        })

        marker3.setMap(map3)

      });
    }
  }

</script>
<style lang="scss">
  .card-map{
    min-height: 350px;
    .map{
      height: 300px;
      width: 100%;
    }
  }
</style>
