# Kattokartta - FMI-tutka + oma liike-ennuste

Tämä versio vie sadekartan kohti Paras sää / Foreca -tyylistä kokemusta avoimilla lähteillä.

Mitä tehty:
- Backend hakee FMI:n tutkakuvan omana proxy/cache-ratkaisuna.
- Selain ei hae FMI WMS:ää suoraan.
- Sliderissä on:
  - Nyt · FMI-tutka
  - +15 min · liike-ennuste
  - +30 min · liike-ennuste
  - +45 min · liike-ennuste
  - +60 min · liike-ennuste
  - +90 min · liike-ennuste
  - +120 min · liike-ennuste
- Tulevat ajat muodostetaan tutkakuvasta sadealueen liike-ennusteeksi.
- Oletusliike:
  - itään 28 km/h
  - pohjoiseen 4 km/h
- Liikettä voi säätää Renderin environment variables -asetuksilla:
  - RAIN_MOTION_EAST_KMH
  - RAIN_MOTION_NORTH_KMH
- FMI-tutkakerros:
  - FMI_RADAR_LAYER, oletus Radar:suomi_dbz_eureffin
  - FMI_RADAR_WMS, oletus https://openwms.fmi.fi/geoserver/Radar/wms
- Jos FMI-tutkaa ei saada, sovellus käyttää aiempaa pehmeää malliennustetta varalla.

Huomio:
Tämä on ensimmäinen oma FMI-tutkaan perustuva nowcast-versio. Paras mahdollinen jatkoversio laskisi sadealueen todellisen liikkeen vertaamalla useita peräkkäisiä tutkakuvia, mutta tämä versio antaa jo FMI-tutkaan perustuvan karttakokemuksen ja säädettävän liike-ennusteen.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
