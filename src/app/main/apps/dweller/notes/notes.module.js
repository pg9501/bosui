(function ()
{
    'use strict';

    angular
      .module('app.dweller.notes', [])
        .config(config);


  angular
    .module('app.dweller.notes').run(function(editableOptions, editableThemes) {
    // set `default` theme
    editableOptions.theme = 'default';

    // overwrite submit button template
    editableThemes['default'].submitTpl = '<button class="md-icon-button md-button md-ink-ripple md-default-theme" type="submit" ng-transclude aria-label="save"><md-icon md-font-icon="icon-checkbox-marked-circle" class="md-accent-fg md-hue-1 ng-scope md-font icon-checkbox-marked-circle material-icons md-default-theme" aria-hidden="true"></md-icon></button>';
    editableThemes['default'].cancelTpl = '<button class="md-icon-button md-button md-ink-ripple md-default-theme" type="button" ng-transclude="" ng-click="$form.$cancel()" aria-label="cancel"><md-icon md-font-icon="icon-close-circle" class="icon-cancel ng-scope md-font icon-close-circle material-icons md-default-theme" aria-hidden="true"></md-icon></button>';
  });

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        $stateProvider.state('app.dweller_notes', {
            url    : '/dweller/notes',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/apps/dweller/notes/notes.html',
                    controller : 'NotesController as vm'
                }
            },
            resolve: {
                Notes : function (NotesService)
                {
                    return NotesService.getData();
                },
                Labels: function (LabelsService)
                {
                    return LabelsService.getData();
                }
            }
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/dweller/notes');

        // Api
        msApiProvider.register('notes.notes', ['app/data/notes/notes.json']);
        msApiProvider.register('notes.labels', ['app/data/notes/labels.json']);

        

    }

})();
