(function ()
{
    'use strict';

    angular.module('app.dweller.calendar')
        .controller('EventDetailDialogController', EventDetailDialogController);

    /** @ngInject */
    function EventDetailDialogController($mdDialog, calendarEvent, showEventFormDialog, event)
    {
        var vm = this;

        // Data
        vm.calendarEvent = calendarEvent;

        vm.calendarEvent.title =vm.calendarEvent.eventData.title;

      console.log(vm.calendarEvent);

        // Methods
        vm.editEvent = editEvent;
        vm.closeDialog = closeDialog;

        //////////

        function closeDialog()
        {
            $mdDialog.hide();
        }

        function editEvent(calendarEvent)
        {
            showEventFormDialog('edit', calendarEvent, false, false, event);
        }
    }
})();
