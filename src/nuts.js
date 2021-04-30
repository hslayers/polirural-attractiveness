import { GeoJSON } from 'ol/format';
import { Vector as VectorSource } from 'ol/source';
import nuts2 from './NUTS_RG_20M_2016_3857_LEVL_2.json';
import nuts3 from './NUTS_RG_20M_2016_3857_LEVL_3.json';

export default {
    nuts2Source: new VectorSource({
        features: (new GeoJSON()).readFeatures(nuts2)
    }),

    nuts3Source: new VectorSource({
        features: (new GeoJSON()).readFeatures(nuts3)
    })
}
