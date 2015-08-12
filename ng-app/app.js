'use strict';

define(['services/routeResolver'], function () {

    var app = angular.module('Blog', ['routeResolverServices', 'ngRoute']);

    app.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider', 
                '$compileProvider', '$filterProvider', '$locationProvider', '$provide', 
        function ($routeProvider, routeResolverProvider, $controllerProvider, 
                  $compileProvider, $filterProvider, $locationProvider, $provide) {

        //Change default views and controllers directory using the following:
        //routeResolverProvider.routeConfig.setBaseDirectories('/app/views', '/app/controllers');
            
        app.register = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };  

        //Define routes - controllers will be loaded dynamically
        var route = routeResolverProvider.route;

        $routeProvider
            .when('/', route.resolve('home', 'home'))
            .when('/about', route.resolve('about', 'about'));

        $locationProvider.html5Mode(true);
        
    }]);

    return app;

});