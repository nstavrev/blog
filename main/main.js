require.config({
    baseUrl: '/javascripts/app',
    urlArgs: 'v=1.0'
});

require(
    [
        'app',
        'services/routeResolver',
    ],
    function() {
        angular.bootstrap(document, ['Blog']);
    });

