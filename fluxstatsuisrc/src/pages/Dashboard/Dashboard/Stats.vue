<template>
  <div class="row">
    <div class="col-md-6">
      <chart-card :chart-data="salesChart.data" :chart-options="salesChart.options">
        <div slot="header">
          <h4 class="card-title">2015 Sales</h4>
          <p class="category">All products including Taxes</p>
        </div>
        <div class="stats" slot="footer-title">
          <i class="ti-check"></i> Data information certified
        </div>
        <div slot="footer">
          <div class="chart-legend">
            <i class="fa fa-circle text-info"></i> Tesla Model S
            <i class="fa fa-circle text-warning"></i> BMW 5 Series
          </div>
          <hr>
          <div class="stats">
            <i class="ti-check"></i> Data information certified
          </div>
        </div>
      </chart-card>
    </div>
    <div class="col-md-6">
      <chart-card :chart-data="usersChart.data" :chart-options="usersChart.options">
        <div slot="header">
          <h4 class="card-title">Users Behavior</h4>
          <p class="category">24 hours performance</p>
        </div>

        <div class="stats" slot="footer-title">
          <i class="ti-reload"></i> Updated 3 minutes ago
        </div>
        <div slot="footer">
          <div class="chart-legend">
            <i class="fa fa-circle text-info"></i> Open
            <i class="fa fa-circle text-danger"></i> Click
            <i class="fa fa-circle text-warning"></i> Click Second Time
          </div>
          <hr>
          <div class="stats">
            <i class="ti-reload"></i> Updated 3 minutes ago
          </div>
        </div>
      </chart-card>
    </div>

    <div class="col-lg-6 col-sm-6">
      <chart-card :chart-data="subscriptionsChart.data" :chart-options="subscriptionsChart.options">
        <span slot="title">169</span>
        <span slot="title-label" class="label label-danger">
          -14%
        </span>
        <h6 slot="subtitle">
          total subscriptions <span class="text-muted">in last</span> 7 days
        </h6>

        <div slot="footer-title">
          View all members
        </div>
        <button slot="footer-right" class="btn btn-default btn-fill btn-icon btn-sm">
          <i class="ti-angle-right"></i>
        </button>
      </chart-card>
    </div>

    <div class="col-lg-6 col-sm-6">
      <chart-card :chart-data="downloadsChart.data" :chart-options="downloadsChart.options">
        <span slot="title">8,960</span>
        <span slot="title-label" class="label label-warning">
          ~51%
        </span>
        <h6 slot="subtitle">
          total downloads <span class="text-muted">in last</span> 6 years
        </h6>

        <div slot="footer-title">
          View more details
        </div>
        <button slot="footer-right" class="btn btn-success btn-fill btn-icon btn-sm">
          <i class="ti-info"></i>
        </button>
      </chart-card>
    </div>



    <div class="col-md-6">
      <task-list></task-list>

      <div class="card card-chat">
        <div class="card-header">
          <h4 class="card-title">Chat</h4>
          <p class="category">With Tania Andrew</p>
        </div>
        <div class="card-content">
          <ol class="chat">
            <li class="other">
              <div class="avatar">
                <img src="static/img/faces/face-2.jpg" alt="crash"/>
              </div>
              <div class="msg">
                <p>
                  Hola!
                  How are you?
                </p>
                <div class="card-footer">
                  <i class="ti-check"></i>
                  <h6>11:20</h6>
                </div>
              </div>
            </li>
            <li class="self">
              <div class="msg">
                <p>
                  Puff...
                  I'm alright. How are you?
                </p>
                <div class="card-footer">
                  <i class="ti-check"></i>
                  <h6>11:22</h6>
                </div>
              </div>
              <div class="avatar">
                <img src="static/img/default-avatar.png" alt="crash"/>
              </div>
            </li>
            <li class="other">
              <div class="avatar">
                <img src="static/img/faces/face-2.jpg" alt="crash"/>
              </div>
              <div class="msg">
                <p>
                  I'm ok too!
                </p>
                <div class="card-footer">
                  <i class="ti-check"></i>
                  <h6>11:24</h6>
                </div>
              </div>
            </li>
            <li class="self">
              <div class="msg">
                <p>
                  Well, it was nice hearing from you.
                </p>
                <div class="card-footer">
                  <i class="ti-check"></i>
                  <h6>11:25</h6>
                </div>
              </div>
              <div class="no-avatar"></div>
            </li>
            <li class="self">
              <div class="msg">
                <p>
                  OK, bye-bye
                  See you!
                </p>
                <div class="card-footer">
                  <i class="ti-check"></i>
                  <h6>11:25</h6>
                </div>
              </div>
              <div class="avatar">
                <img src="static/img/default-avatar.png" alt="crash"/>
              </div>
            </li>
          </ol>
          <hr>
          <div class="send-message">
            <div class="avatar">
              <img src="static/img/default-avatar.png" alt="crash"/>
            </div>
            <input class="form-control textarea" type="text" placeholder="Type here!"/>
            <div class="send-button">
              <button class="btn btn-primary btn-fill">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <time-line type="simple">
        <time-line-item class="timeline-inverted" badge-type="danger" badgeIcon="ti-gallery">
          <span slot="header" class="label label-danger">Some title</span>
          <p slot="body">
            Wifey made the best Father's Day meal ever. So thankful so happy so blessed. Thank you for making my family We just had fun with the “future” theme !!!   It was a fun night all together ... The always rude Kanye Show at 2am Sold Out Famous viewing @ Figueroa and 12th in downtown.</p>

          <h6 slot="footer">
            <i class="ti-time"></i>
            11 hours ago via Twitter
          </h6>
        </time-line-item>

        <time-line-item class="timeline-inverted" badge-type="success" badgeIcon="ti-credit-card">
          <span slot="header" class="label label-info">Another Title</span>
          <p slot="body">
            Thank God for the support of my wife and real friends. I also wanted to point out that it’s the first album to go number 1 off of streaming!!! I love you Ellen and also my number one design rule of anything I do from shoes to music to homes is that Kim has to like it....</p>
        </time-line-item>

        <time-line-item class="timeline-inverted" badge-type="info" badgeIcon="ti-check-box">
          <span slot="header" class="label label-success">Another Title</span>
          <div slot="body">
            <p>
              Called I Miss the Old Kanye That’s all it was Kanye And I love you like Kanye loves Kanye Famous viewing @ Figueroa and 12th in downtown LA 11:10PM</p>
            <p>
              What if Kanye made a song about Kanye Royère doesn't make a Polar bear bed but the Polar bear couch is my favorite piece of furniture we own It wasn’t any Kanyes Set on his goals Kanye</p>
            <hr>
            <drop-down>
              <button slot="title" type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown">
                <i class="ti-settings"></i> <span class="caret"></span>
              </button>
              <li><a href="#action">Action</a></li>
              <li><a href="#action">Another action</a></li>
              <li><a href="#here">Something else here</a></li>
              <li class="divider"></li>
              <li><a href="#link">Separated link</a></li>
            </drop-down>
          </div>
        </time-line-item>

      </time-line>
    </div>
  </div>
</template>
<script>
  import TimeLine from './Stats/TimeLine.vue'
  import TimeLineItem from './Stats/TimeLineItem.vue'
  import TaskList from './Stats/TaskList'
  import ChartCard from 'src/components/Cards/ChartCard.vue'

  export default {
    components: {
      TimeLine,
      TimeLineItem,
      ChartCard,
      TaskList
    },
    data () {
      return {
        salesChart: {
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            series: [
              [542, 543, 520, 680, 653, 753, 326, 434, 568, 610, 756, 895],
              [230, 293, 380, 480, 503, 553, 600, 664, 698, 710, 736, 795]
            ]
          },
          options: {
            seriesBarDistance: 10,
            axisX: {
              showGrid: false
            },
            height: '245px'
          }
        },
        usersChart: {
          data: {
            labels: ['9AM', '12AM', '3PM', '6PM', '9PM', '12PM', '3AM', '6AM'],
            series: [
              [287, 385, 490, 562, 594, 626, 698, 895, 952],
              [67, 152, 193, 240, 387, 435, 535, 642, 744],
              [23, 113, 67, 108, 190, 239, 307, 410, 410]
            ]
          },
          options: {
            low: 0,
            high: 1000,
            showArea: true,
            height: '245px',
            axisX: {
              showGrid: false
            },
            showLine: true,
            showPoint: false
          }
        },
        subscriptionsChart: {
          data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            series: [
              [60, 50, 30, 50, 70, 60, 90, 100]
            ]
          },
          options: {
            showPoint: false,
            lineSmooth: true,
            height: '210px',
            axisX: {
              showGrid: false,
              showLabel: true
            },
            axisY: {
              offset: 40,
              showGrid: false
            },
            low: 0,
            high: 'auto',
            classNames: {
              line: 'ct-line ct-red'
            }
          }
        },
        downloadsChart: {
          data: {
            labels: ['2009', '2010', '2011', '2012', '2013', '2014'],
            series: [
              [1200, 1000, 3490, 8345, 3256, 2566]
            ]
          },
          options: {
            showPoint: false,
            lineSmooth: true,
            height: '210px',
            axisX: {
              showGrid: false,
              showLabel: true
            },
            axisY: {
              offset: 40,
              showGrid: false
            },
            low: 0,
            high: 'auto',
            classNames: {
              line: 'ct-line ct-orange'
            }
          }
        }
      }
    }
  }
</script>
<style>
</style>
