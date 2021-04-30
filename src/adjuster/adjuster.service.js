//import attractivity from '../Attractivity.json';
import nuts from '../nuts';

export default ['HsCore', 'HsUtilsService', '$rootScope', '$http',
    function (Core, utils, $rootScope, $http) {
        var me = {
            factors: [
                {
                    name: 'Natural',
                    column: 'N_index',
                    weight: 1
                },
                {
                    name: 'Social & Human',
                    column: 'S_index',
                    weight: 1
                },
                {
                    name: 'Anthropic',
                    column: 'A_index',
                    weight: 1
                },
                {
                    name: 'Economical',
                    column: 'E_index',
                    weight: 1
                },
                {
                    name: 'Cultural',
                    column: 'C_index',
                    weight: 1
                },
                {
                    name: 'Institutional',
                    column: 'I_index',
                    weight: 1
                }
            ],
            apply() {
                utils.debounce(function() {
                    $http({
                        method: 'post',
                        url: 'https://publish.lesprojekt.cz/nodejs/scores',
                        data: {
                            "factors": me.factors.map(f => {
                                return {
                                    factor: f.factor,
                                    weight: f.weight,
                                    datasets: f.datasets.filter(ds => ds.included).map(ds => ds.name)
                                }
                            })
                        }
                    }).
                    then(response => {
                        me.attractivity = response.data;
                        let max = 0;
                        me.attractivity.forEach(a => {
                            if (a.aggregate > max) max = a.aggregate;
                        });
                        let normalizer = 1 / max;
                        me.attractivity.forEach(a => {
                            a.aggregate *= normalizer;
                        })
                        me.attractivity.forEach(a => {
                            me.nutsCodeRecordRelations[a.code] = a;
                        })
                        nuts.nuts3Source.forEachFeature(feature => {
                            feature.set('total', me.nutsCodeRecordRelations[feature.get('NUTS_ID')].aggregate);
                            feature.set('totalForHumans', (me.nutsCodeRecordRelations[feature.get('NUTS_ID')].aggregate * 100).toFixed(2));
                            me.factors.forEach(factor => {
                                feature.set(factor.factor, (me.nutsCodeRecordRelations[feature.get('NUTS_ID')][factor.factor] * 100).toFixed(2))
                            })
                        })
                    })

                /*
               
            */}, 300)()
            }
        };
        me.nutsCodeRecordRelations = {};


        $http({ url: 'https://publish.lesprojekt.cz/nodejs/datasets' }).
            then(response => {
                me.factors = response.data.map(dataset => { return { factor: dataset.Factor, weight: 1, datasets: [] } });
                me.factors = utils.removeDuplicates(me.factors, 'factor');
                me.factors.forEach(factor => {
                    factor.datasets = response.data
                        .filter(ds => ds.Factor == factor.factor)
                        .map(ds => {
                            return {
                                name: ds.Name,
                                included: true
                            }
                        })

                })
                me.apply();
            })



        return me;
    }
]
