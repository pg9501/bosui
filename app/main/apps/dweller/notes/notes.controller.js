(function ()
{
    'use strict';

    angular
        .module('app.dweller.notes')
        .controller('NotesController', NotesController);

    /** @ngInject */
    function NotesController($document, $timeout, $scope, $mdSidenav, NotesService, LabelsService, $mdDialog,msNavigationService)
    {
      function initializeNavigator() {
        msNavigationService.saveItem('administration', {
          title : 'ADMINISTRATION ',
          group : true,
          weight: 1,
          hidden: function () {
            return true;
          }
        });

        msNavigationService.saveItem('dweller', {
          title : 'DWELLERS',
          group : true,
          weight: 1,
          hidden: function () {
            return true;
          }

        });
        msNavigationService.saveItem('optimization_goals', {
          title : 'OPTIMIZATION',
          group : true,
          weight: 2,
          hidden: function () {
            return true;
          }
        });
        msNavigationService.saveItem('history', {
          title : 'HISTORY',
          group : true,
          weight: 3,
          hidden: function () {
            return true;
          }
        });
        msNavigationService.saveItem('community', {
          title : 'COMMUNITY',
          group : true,
          weight: 4,
          hidden: function () {
            return true;
          }
        });
        msNavigationService.saveItem('utility-company', {
          title : 'UTILITY COMPANY',
          group : true,
          weight: 5,
          hidden: function () {
            return true;
          }
        });

        msNavigationService.saveItem('dweller', {
          title : 'DWELLERS',
          group : true,
          weight: 1,
          hidden: function () {
            return true;
          }

        });

        msNavigationService.saveItem('energy-management', {
          title : 'ENERGY MANAGEMENT',
          group : true,
          weight: 1,
          hidden: function () {
            return false;
          }
        });

        msNavigationService.saveItem('life-assistant', {
          title : 'LIFE ASSISTANT ',
          group : true,
          weight: 2,
          hidden: function () {
            return false;
          }
        });
      }

      initializeNavigator();
      
        var vm = this;

        // Data
        vm.notes = NotesService.data;
        vm.labels = LabelsService.data;
        vm.search = '';
        vm.searchToolbar = false;
        vm.filters = {
            archive: false
        };
        vm.labelFilterIds = [];
        vm.noteListType = 'notes';

        // Methods
        vm.filterChange = filterChange;
        vm.openSearchToolbar = openSearchToolbar;
        vm.closeSearchToolbar = closeSearchToolbar;
        vm.editNote = editNote;
        vm.deleteLabel = deleteLabel;
        vm.toggleSidenav = toggleSidenav;
        vm.addNewLabel = LabelsService.addLabel;

        //////////

        /**
         * Change Notes Filter
         * @param type
         */
        function filterChange(type)
        {

            vm.noteListType = type;

            if ( type === 'notes' )
            {
                vm.labelFilterIds = [];
                vm.filters = {
                    archive: false
                };
            }
            else if ( type === 'archive' )
            {
                vm.labelFilterIds = [];
                vm.filters = {
                    archive: true
                };
            }
            else if ( type === 'reminders' )
            {
                vm.labelFilterIds = [];
                vm.filters = {
                    reminder: '',
                    archive : false
                };
            }
            else if ( angular.isObject(type) )
            {
                vm.labelFilterIds = [];
                vm.labelFilterIds.push(type.id);
            }

            $mdSidenav('main-sidenav').close();

        }

        /**
         * Edit Note
         * @param ev
         * @param noteId
         */
        function editNote(ev, noteId)
        {
            $mdDialog.show({
                template           : '<md-dialog ms-scroll><ms-note-form note-type="\'edit\'" note-id="\'' + noteId + '\'"></ms-note-form></md-dialog>',
                parent             : $document.find('#notes'),
                targetEvent        : ev,
                clickOutsideToClose: true,
                escapeToClose      : true
            });
        }

        /**
         * Delete Label
         * @param ev
         * @param label
         */
        function deleteLabel(ev, label)
        {
            var confirm = $mdDialog.confirm()
                .title('Are you sure want to delete the label?')
                .htmlContent('The "' + label.name + '" label will be deleted permanently.')
                .ariaLabel('delete label')
                .targetEvent(ev)
                .ok('OK')
                .cancel('CANCEL');

            $mdDialog.show(confirm).then(function ()
            {
                LabelsService.deleteLabel(label);
            });
        }

        /**
         * Open Search Toolbar
         */
        function openSearchToolbar()
        {
            vm.searchToolbar = true;

            $timeout(function ()
            {
                angular.element($document.find('#search-notes-input')).trigger('focus');

            });

            $document.on('keyup', escKeyEvent);
        }

        /**
         * Close Search Toolbar
         */
        function closeSearchToolbar()
        {
            $scope.$evalAsync(function ()
            {
                vm.searchToolbar = false;
                vm.search = '';
            });

            $document.off('keyup', escKeyEvent);
        }

        /**
         * Escape key event
         */
        function escKeyEvent(e)
        {
            if ( e.keyCode === 27 )
            {
                closeSearchToolbar();
            }
        }

        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }

        /**
         * Array prototype
         *
         * Get by id
         *
         * @param value
         * @returns {T}
         */
        Array.prototype.getById = function (value)
        {
            return this.filter(function (x)
            {
                return x.id === value;
            })[0];
        };

    }

})();
