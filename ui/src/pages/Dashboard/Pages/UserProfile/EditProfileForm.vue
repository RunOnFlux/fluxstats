<template>
  <card>
    <div slot="header">
      <h4 class="title">
        Edit Profile
      </h4>
    </div>
    <div>
      <form>
        <div class="row">
          <div class="col-md-5">
            <fg-input
              v-model="user.company"
              type="text"
              label="Company"
              :disabled="true"
              placeholder="Paper dashboard"
            />
          </div>
          <div class="col-md-3">
            <fg-input
              v-model="user.username"
              type="text"
              label="Username"
              placeholder="Username"
            />
          </div>
          <div class="col-md-4">
            <fg-input
              v-model="user.email"
              type="email"
              label="Username"
              placeholder="Email"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <fg-input
              v-model="user.firstName"
              type="text"
              label="First Name"
              placeholder="First Name"
            />
          </div>
          <div class="col-md-6">
            <fg-input
              v-model="user.lastName"
              type="text"
              label="Last Name"
              placeholder="Last Name"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <fg-input
              v-model="user.address"
              type="text"
              label="Address"
              placeholder="Home Address"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <fg-input
              v-model="user.city"
              type="text"
              label="City"
              placeholder="City"
            />
          </div>
          <div class="col-md-4">
            <fg-input
              v-model="user.country"
              type="text"
              label="Country"
              placeholder="Country"
            />
          </div>
          <div class="col-md-4">
            <fg-input
              v-model="user.postalCode"
              label="Postal Code"
              placeholder="ZIP Code"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <fg-input label="About Me">
              <el-input
                v-model="user.aboutMe"
                type="textarea"
                autosize
                placeholder="ZIP Code"
              />
            </fg-input>
          </div>
        </div>
        <div class="text-center">
          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd"
            @click.prevent="updateProfile"
          >
            Update Profile
          </button>
        </div>
        <div class="clearfix" />
      </form>
    </div>
  </card>
</template>
<script>
export default {
  data() {
    return {
      user: {
        company: 'Paper Dashboard',
        username: 'michael23',
        email: '',
        lastName: 'Faker',
        address: 'Melbourne, Australia',
        city: 'melbourne',
        postalCode: '',
        aboutMe: 'Oh so, your weak rhyme. You doubt I\'ll bother, reading into it.I\'ll probably won\'t, left to my own devicesBut that\'s the difference in our opinions.',
      },
    };
  },
  methods: {
    updateProfile() {
      alert(`Your data: ${JSON.stringify(this.user)}`);
    },
  },
};

</script>
<style>
</style>
