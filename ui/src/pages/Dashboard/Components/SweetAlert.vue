<template>
  <div>
    <h4 class="card-title">Sweet Alert 2</h4>
    <p class="category">A beautiful plugin, that replace the classic alert, Handcrafted by our friend
      <a target="_blank" rel="noopener"
         href="https://twitter.com/t4t5">Tristan Edwards</a>. Please check out the <a
        href="http://limonte.github.io/sweetalert2/" target="_blank" rel="noopener">full documentation.</a>
    </p>
    <br>

    <div class="places-sweet-alerts">
      <div class="row">
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>Basic example</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('basic')">Try me!</button>
            </div>
          </card>
        </div>
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>A title with a text under</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('title-and-text')">Try me!</button>
            </div>
          </card>
        </div>
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>A success message</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('success-message')">Try me!</button>
            </div>
          </card>
        </div>
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>Custom HTML description</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('custom-html')">Try me!</button>
            </div>
          </card>
        </div>
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>A warning message, with a function attached to the "Confirm" Button...</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('warning-message-and-confirmation')">
                Try me!
              </button>
            </div>
          </card>
        </div>
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>...and by passing a parameter, you can execute something else for "Cancel"</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('warning-message-and-cancel')">Try me!
              </button>
            </div>
          </card>
        </div>
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>A message with auto close timer set to 2 seconds</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('auto-close')">Try me!</button>
            </div>
          </card>
        </div>
        <div class="col-md-3">
          <card>
            <div class="card-content text-center">
              <h5>Modal window with input field</h5>
              <button class="btn btn-default btn-fill" @click="showSwal('input-field')">Try me!</button>
            </div>
          </card>
        </div>
      </div>
    </div>

    <h4 class="card-title">Modals</h4>
    <p class="category">Highly customizable modal components. Please check out the <a
      href="http://element.eleme.io/#/en-US/component/dialog" target="_blank" rel="noopener">full documentation.</a>
    </p>
    <br>

    <div class="row">
      <div class="col-md-3">
        <card>
          <div class="card-content text-center">
            <h5>Simple modal</h5>
            <button class="btn btn-default btn-fill" @click="openModal('basic')">Try me!</button>
          </div>
          <el-dialog
            title="Basic Modal"
            :visible.sync="modals.basic">
            <span>This is a message</span>
            <span slot="footer" class="dialog-footer">
              <button class="btn btn-danger" @click="closeModal('basic')">Cancel</button>&nbsp;
              <button class="btn btn-success" @click="closeModal('basic')">Confirm</button>
            </span>
          </el-dialog>
        </card>
      </div>

      <div class="col-md-3">
        <card>
          <div class="card-content text-center">
            <h5>Centered content</h5>
            <button class="btn btn-default btn-fill" @click="openModal('centered')">Try me!</button>
          </div>
          <el-dialog
            center
            title="Centered Content"
            :visible.sync="modals.centered">
            <span>It should be noted that the content will not be aligned in center by default</span>
            <span slot="footer" class="dialog-footer">
              <button class="btn btn-danger" @click="closeModal('centered')">Cancel</button>&nbsp;
              <button class="btn btn-success" @click="closeModal('centered')">Confirm</button>
            </span>
          </el-dialog>
        </card>
      </div>

      <div class="col-md-3">
        <card>
          <div class="card-content text-center">
            <h5>Custom content</h5>
            <button class="btn btn-default btn-fill" @click="openModal('custom')">Try me!</button>
          </div>
          <el-dialog
            center
            title="Custom Content"
            :visible.sync="modals.custom">
            <el-table :data="gridData">
              <el-table-column min-width="100" property="date" label="Date"></el-table-column>
              <el-table-column min-width="100" property="name" label="Name"></el-table-column>
              <el-table-column min-width="150" property="address" label="Address"></el-table-column>
            </el-table>
          </el-dialog>
        </card>
      </div>
      <div class="col-md-3">
        <card>
          <div class="card-content text-center">
            <h5>Confirm upon closing</h5>
            <button class="btn btn-default btn-fill" @click="openModal('confirm')">Try me!</button>
          </div>
          <el-dialog
            center
            :before-close="handleClose"
            title="Confirm upon closing"
            :visible.sync="modals.confirm">
            <span>It should be noted that the content will not be aligned in center by default</span>
            <span slot="footer" class="dialog-footer">
              <button class="btn btn-danger" @click="closeModal('confirm')">Cancel</button>&nbsp;
              <button class="btn btn-success" @click="closeModal('confirm')">Confirm</button>
            </span>
          </el-dialog>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
  import Swal from 'sweetalert2'
  import Vue from 'vue'
  import { Dialog, Table, TableColumn, MessageBox } from 'element-ui'

  Vue.prototype.$confirm = MessageBox.confirm
  export default {
    components: {
      [Dialog.name]: Dialog,
      [Table.name]: Table,
      [TableColumn.name]: TableColumn
    },
    data () {
      return {
        modals: {
          basic: false,
          centered: false,
          custom: false,
          confirm: false
        },
        gridData: [{
          date: '2016-05-02',
          name: 'John Smith',
          address: 'No.1518,  Jinshajiang Road, Putuo District'
        }, {
          date: '2016-05-04',
          name: 'John Smith',
          address: 'No.1518,  Jinshajiang Road, Putuo District'
        }, {
          date: '2016-05-01',
          name: 'John Smith',
          address: 'No.1518,  Jinshajiang Road, Putuo District'
        }, {
          date: '2016-05-03',
          name: 'John Smith',
          address: 'No.1518,  Jinshajiang Road, Putuo District'
        }]
      }
    },
    methods: {
      openModal (name) {
        this.modals[name] = true
      },
      closeModal (name) {
        this.modals[name] = false
      },
      async handleClose (done) {
        try {
          await this.$confirm('Are you sure you want to close this dialog?')
          done()
        } catch (e) {}
      },
      showSwal (type) {
        if (type === 'basic') {
          Swal.fire({
            title: `Here's a message!`,
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-success btn-fill'
          })
        } else if (type === 'title-and-text') {
          Swal.fire({
            title: `Here's a message!`,
            text: `It's pretty, isn't it?`,
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-info btn-fill'
          })
        } else if (type === 'success-message') {
          Swal.fire({
            title: `Good job!`,
            text: 'You clicked the button!',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-success btn-fill',
            type: 'success'
          })
        } else if (type === 'warning-message-and-confirmation') {
          Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert this!`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            confirmButtonText: 'Yes, delete it!',
            buttonsStyling: false
          }).then(function () {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your file has been deleted.',
              type: 'success',
              confirmButtonClass: 'btn btn-success btn-fill',
              buttonsStyling: false
            })
          })
        } else if (type === 'warning-message-and-cancel') {
          Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this imaginary file!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            buttonsStyling: false
          }).then(function () {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your imaginary file has been deleted.',
              type: 'success',
              confirmButtonClass: 'btn btn-success btn-fill',
              buttonsStyling: false
            })
          }, function (dismiss) {
            // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
            if (dismiss === 'cancel') {
              Swal.fire({
                title: 'Cancelled',
                text: 'Your imaginary file is safe :)',
                type: 'error',
                confirmButtonClass: 'btn btn-info btn-fill',
                buttonsStyling: false
              })
            }
          })
        } else if (type === 'custom-html') {
          Swal.fire({
            title: 'HTML example',
            buttonsStyling: false,
            confirmButtonClass: 'btn btn-success btn-fill',
            html: 'You can use <b>bold text</b>, ' +
            '<a href="http://github.com">links</a> ' +
            'and other HTML tags'
          })
        } else if (type === 'auto-close') {
          Swal.fire({
            title: 'Auto close alert!',
            text: 'I will close in 2 seconds.',
            timer: 2000,
            showConfirmButton: false
          })
        } else if (type === 'input-field') {
          Swal.fire({
            title: 'Input something',
            html: '<div class="form-group">' +
            '<input id="input-field" type="text" class="form-control" />' +
            '</div>',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success btn-fill',
            cancelButtonClass: 'btn btn-danger btn-fill',
            buttonsStyling: false
          }).then(function (result) {
            Swal.fire({
              type: 'success',
              html: 'You entered',
              confirmButtonClass: 'btn btn-success btn-fill',
              buttonsStyling: false

            })
          }).catch(Swal.noop)
        }
      }
    }
  }
</script>
<style>
  .el-dialog {
    width: 50%;
  }
  @media (max-width: 800px){
    .el-dialog{
      width: 90%
    }
  }
</style>
