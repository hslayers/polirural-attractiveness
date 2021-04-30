export default {
    template: require('./adjuster.directive.html'),
    controller: ['$scope', 'HsMapService', 'HsCore', 'HsConfig', 'pra.adjuster.service', 'HsUtilsService',
        function ($scope, OlMap, Core, config, adjusterService, utils) {
            $scope.loading = false;
            $scope.utils = utils;

            angular.extend($scope, {
                Core,
                adjusterService,
            })

            $scope.$emit('scope_loaded', "adjuster");
        }
    ]
}
