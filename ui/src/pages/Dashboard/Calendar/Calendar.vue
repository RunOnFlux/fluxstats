<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card card-calendar">
          <div class="card-body">
            <fullCalendar ref="calendar" :options="calendarOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import swal from 'sweetalert2';
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { INITIAL_EVENTS, createEventId } from "./event-utils";
const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();
const d = today.getDate();
export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      calendarOptions: {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin, // needed for dateClick
        ],
        headerToolbar: {
          center: "dayGridMonth,timeGridWeek,timeGridDay",
          right: "prev,next,today",
        },
        initialView: "dayGridMonth",
        initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        editable: true,
        selectable: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
      },
      currentEvents: [],
    };
  },
  methods: {
    handleWeekendsToggle() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends; // update a property
    },
    handleDateSelect(selectInfo) {
      // on select we show the Sweet Alert modal with an input
      const swalWithBootstrapButtons = swal.mixin({
        customClass: {
          confirmButton: "btn btn-success btn-fill",
          cancelButton: "btn btn-danger btn-fill",
        },
        buttonsStyling: false,
      });
      swalWithBootstrapButtons
        .fire({
          title: "Create an Event",
          html: `<div class="md-field md-theme-default">
          <input type="text" id="md-input" class="md-input">
          </div>`,
          showCancelButton: true,
        })
        .then(() => {
          var title = document.getElementById("md-input").value;
          let calendarApi = selectInfo.view.calendar;
          calendarApi.unselect(); // clear date selection
          if (title) {
            calendarApi.addEvent({
              id: createEventId(),
              title,
              start: selectInfo.startStr,
              end: selectInfo.endStr,
              allDay: selectInfo.allDay,
            });
          }
        });
    },
    handleEventClick(clickInfo) {
      if (
        confirm(
          `Are you sure you want to delete the event '${clickInfo.event.title}'`
        )
      ) {
        clickInfo.event.remove();
      }
    },
    handleEvents(events) {
      this.currentEvents = events;
    },
  },
};
</script>
<style>
#fullCalendar {
  min-height: 400px;
}
.el-loading-spinner .path {
  stroke: #66615b !important;
}
</style>