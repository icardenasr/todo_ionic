# Aplicación móvil de lista de tareas #

Desarrollado en HTML5 + CSS + AngularJS + Cordova, mediante Ionic Framework.
Esta aplicación es una variación del tutorial de Ionic, con más funcionalidades.

### Requisitos: ###
* Ionic Framework: http://ionicframework.com/
* Angular DatePicket: https://github.com/alongubkin/angular-datepicker

### Comandos para creación de la aplicación: ###
* ionic start Consigna blank
* cd Consigna
* ionic platform add ios
* ionic platform add android

### Comandos para instalacion de requisitos ###
* bower install ngCordova
* cordova plugin add http://github.com/VitaliiBlagodir/cordova-plugin-datepicker


### Compilación de la aplicación: ###
* ionic build ios
* ionic build android

### Ejecución de la aplicación en el ordenador: ###
* ionic serve

### Ejecución de la aplicación en el emulador: ###
* ionic emulate ios —-livereload
* * Ver logs: consolelogs
* ionic emulate android —-livereload
* * Ver logs: consolelogs

### Ejecución de la aplicación en dispositivo real: ###
* ionic run ios
* ionic run android
