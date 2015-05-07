// Ionic Todo Improved App

// REQUISITO: bower install ngCordova
var app = angular.module('starter', ['ionic', 'ngCordova']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

// Factoria para almacen de datos de Proyectos
app.factory("Projects", function() {
  return {
    // Devuelve todos los proyectos
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    // Guarda todos los proyectos con sus tareas
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    // Crea un nuevo objeto proyecto (solo crea el objeto, no lo guarda)
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    // Devuelve el índice del ultimo proyecto activo
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    // Guarda el indice del ultimo proyecto activo
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  };
});

// Controlador para la pagina principal
// REQUISITO: cordova plugin add http://github.com/VitaliiBlagodir/cordova-plugin-datepicker
app.controller('ContentController', ['$scope', '$ionicSideMenuDelegate', '$ionicModal', '$ionicPopup',
  'Projects', '$timeout', '$cordovaDatePicker',
  function($scope, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, Projects, $timeout, $cordovaDatePicker) {

    // Variable utilizada para la creacion de un nuevo proyecto
    $scope.aNewProject = { title: "" };

    // Variable que controla el borrado de las tareas y proyectos
    $scope.showDeleteTasks = false;
    $scope.showDeleteProjects = false;

    // Variables que controlan la ordenacion de las tareas y proyectos
    $scope.showReorderTasks = false;
    $scope.showReorderProjects = false;

    // Variable que controlan la seleccion de fechas limite para nuevas tareas
    $scope.deadlineSelected = false;
    $scope.newDeadline = new Date();
    $scope.newDeadlineString = '';

    // Inicializamos los proyectos
    $scope.projects = Projects.all();

    // Inicializamos el proyecto activo como el ultimo que hubo, o el primero
    $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

    // Inicializamos la ventana modal para la creación de una nueva tarea
    $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
      $scope.taskModal = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    // Funcion que recorta un texto al numero de caracteres dado
    $scope.splitText = function(myText, myNum) {
      if (myText.length > myNum) {
        myText = myText.substring(0, myNum-3) + "...";
      }
      return myText;
    };

    // Funcion que permite seleccionar una tarea
    $scope.selectTask = function(task, index) {
      console.log("Select task: " + index);
    };

    // Funcion que permite mostrar la ventana modal para crear nueva tarea
    $scope.newTask = function() {
      $scope.taskModal.show();
    };

    // Funcion que permite cerrar la ventana modal para crear nueva tarea
    $scope.closeNewTask = function() {
      $scope.taskModal.hide();
      // Reseteamos las variables encargadas de la fecha limite
      $scope.newDeadline = new Date();
      $scope.newDeadlineString = '';
      $scope.deadlineSelected = false;
    };

    // Funcion que muestra el picker para la fecha de una tarea
    $scope.selectDeadline = function() {
      // Opciones para el selector de fechas para las tareas
      minDate = ionic.Platform.isIOS() ? new Date() : (new Date()).valueOf();
      var datePickerOptions = {
        date: new Date(),
        mode: 'date', // or 'time'
        minDate: minDate,
        allowOldDates: false,
        allowFutureDates: true,
        doneButtonLabel: 'Done',
        doneButtonColor: '#377ef5',
        cancelButtonLabel: 'Cancel',
        cancelButtonColor: '#ef4639'
      };
      // Mostramos el selector de fechas
      $cordovaDatePicker.show(datePickerOptions)
        .then(function(date){
          $scope.newDeadline = date;
          $scope.deadlineSelected = true;
          // Pasamos la fecha al formato cadena
          var dlYear = $scope.newDeadline.getFullYear();
          var dlMonth = $scope.newDeadline.getMonth() + 1;
          var dlDate = $scope.newDeadline.getDate();
          var dlMonthString = '' + dlMonth;
          if (dlMonth < 10) {
            dlMonthString = '0' + dlMonth;
          }
          var dlDateString = '' + dlDate;
          if (dlDate < 10) {
            dlDateString = '0' + dlDate;
          }
          $scope.newDeadlineString = dlYear + '-' + dlMonthString + '-' + dlDateString;
        });
    };

    // Funcion que permite crear una nueva tarea desde la ventana modal
    $scope.createTask = function(task) {
      // Si no hay proyecto activo o la tarea esta vacia no se hace nada
      if(!$scope.activeProject || !task) {
        return;
      }
      // Deshabilitamos el estado de borrar tareas
      $scope.showDeleteTasks = false;
      // Comprobamos si se ha elegido una fecha limite
      if ($scope.deadlineSelected) {
        // Hay fecha limite - Introducimos la nueva tarea al final del proyecto
        $scope.activeProject.tasks.push({
          title: task.title,
          deadline: $scope.newDeadlineString
        });
      } else {
        // No hay fecha limite - Introducimos la nueva tarea al final del proyecto
        $scope.activeProject.tasks.push({
          title: task.title
        });
      }
      // Ocultamos la ventana modal
      $scope.taskModal.hide();
      // Guardamos todos los proyectos (ineficiente!)
      Projects.save($scope.projects);
      // Reseteamos al titulo de la tarea para que salga vacio para la proxima
      task.title = "";
      // Reseteamos las variables encargadas de la fecha limite
      $scope.newDeadline = new Date();
      $scope.newDeadlineString = '';
      $scope.deadlineSelected = false;
    };

    // Funcion que muestra el menu de la izquierda
    $scope.toggleProjects = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

    // Funcion que permite crear un nuevo proyecto mediante un aviso
    $scope.newProject = function() {
      // Solicitamos el nombre del nuevo proyecto
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="aNewProject.title">',
        title: 'Your first project name:',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ($scope.aNewProject.title) {
                // Se ha introducido un nombre de proyecto
                createProject($scope.aNewProject.title);
                // Reseteamos el valor introducido
                $scope.aNewProject = { title: "" };
              } else {
                // No se ha introducido nombre de proyecto - Volvemos a pedir
                $scope.aNewProject = { title: "" };
                $scope.forceOneProject();
              }
            }
          }
        ]
      });
    };

    // Funcion que crea y guarda un nuevo proyecto dado su titulo
    var createProject = function(projectTitle) {
      // Deshabilitamos el estado de borrar proyectos
      $scope.showDeleteProjects = false;
      // Se crea el objeto del proyecto haciendo uso de la factoria
      var newProject = Projects.newProject(projectTitle);
      // Introducimos el nuevo proyecto en la variable del scope que los guarda
      $scope.projects.push(newProject);
      // Almacenamos dicha variable en el almacenamiento local mediante la factoria
      Projects.save($scope.projects);
      // Seleccionamos el proyecto creado como activo
      $scope.selectProject(newProject, $scope.projects.length-1);
    }

    // Funcion que selecciona un proyecto como activo y cierra el menu lateral
    $scope.selectProject = function(project, index) {
      $scope.activeProject = project;
      Projects.setLastActiveIndex(index);
      $ionicSideMenuDelegate.toggleLeft(false);
    };

    // Funcion que muestra u oculta el borrado de las tareas
    $scope.toggleDeleteTasks = function() {
      $scope.showDeleteTasks = !$scope.showDeleteTasks;
    }

    // Funcion que muestra u oculta el reordenado de las tareas
    $scope.toggleReorderTasks = function() {
      $scope.showReorderTasks = !$scope.showReorderTasks;
    }

    // Funcion que muestra u oculta el borrado de los proyectos
    $scope.toggleDeleteProjects = function() {
      $scope.showDeleteProjects = !$scope.showDeleteProjects;
    }

    // Funcion que muestra u oculta el reordenado de los proyectos
    $scope.toggleReorderProjects = function() {
      $scope.showReorderProjects = !$scope.showReorderProjects;
    }

    // Funcion que permite el borrado de una tarea
    $scope.deleteTask = function(index) {
      $scope.activeProject.tasks.splice(index, 1);
      Projects.save($scope.projects);
    }

    // Funcion que permite el borrado de un proyecto
    $scope.deleteProject = function(index) {
      // Borramos el proyecto elegido
      $scope.projects.splice(index, 1);
      Projects.save($scope.projects);
      // Comprobamos si hay mas proyectos
      if($scope.projects.length == 0) {
        $scope.forceOneProject();
      } else {
        // Quedan proyectos - Comprobamos si el proyecto borrado es el activo
        if (index == Projects.getLastActiveIndex()) {
          // El proyecto eliminado es el que esta activo
          if (index == 0) {
            // Nos movemos al siguiente
            $scope.activeProject = $scope.projects[index];
            Projects.setLastActiveIndex(index);
          } else {
            // Nos movemos al anterior
            $scope.activeProject = $scope.projects[index-1];
            Projects.setLastActiveIndex(index-1);
          }
        }
      }
    }

    // Funcion que permite cambiar el orden de una tarea
    $scope.reorderTask = function(task, fromIndex, toIndex) {
      $scope.activeProject.tasks.splice(fromIndex, 1);
      $scope.activeProject.tasks.splice(toIndex, 0, task);
      Projects.save($scope.projects);
    }

    // Funcion que permite cambiar el orden de los proyectos
    $scope.reorderProject = function(project, fromIndex, toIndex) {
      $scope.projects.splice(fromIndex, 1);
      $scope.projects.splice(toIndex, 0, project);
      Projects.save($scope.projects);
    }

    // Comprobacion inicial de si existe algun proyecto, y si no, se pide crear
    $timeout(function() {
      if($scope.projects.length == 0) {
        $scope.forceOneProject();
      }
    });

    // Funcion que fuerza la creacion de un primer proyecto si no hay ninguno
    $scope.forceOneProject = function() {
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="aNewProject.title">',
        title: 'Your first project name:',
        scope: $scope,
        buttons: [
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ($scope.aNewProject.title) {
                // Se ha introducido un nombre de proyecto
                createProject($scope.aNewProject.title);
                // Reseteamos el valor introducido
                $scope.aNewProject = { title: "" };
              } else {
                // No se ha introducido nombre de proyecto - Volvemos a pedir
                $scope.aNewProject = { title: "" };
                $scope.forceOneProject();
              }
            }
          }
        ]
      });
    }

  }]);
