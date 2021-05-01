<template>
  <div class="banner d-flex align-center">
    <v-row>
      <v-col md="6" cols="12" style="opacity: 0.95">
        <v-card class="px-10 py-10">
          <h1 class="mb-4">Listen to academic papers</h1>
          <p>
            This app is designed for audiobook lovers to listen academic
            writings. You can simply upload a paper in pdf format, and the app
            will automatically extract text that are suitable to read aloud and
            convert them to mp3 audio. Features of the app:
          </p>
          <ul class="banner-function-list">
            <li>
              Support double and single column layout for English academic paper
            </li>
            <li>
              Strip away unneceaary text (footer, header, reference, urls, etc.)
              for audio output
            </li>
            <li>
              Powerful text-to-speech tools rendering
              <strong>lifelike voices</strong> with customizatable options
            </li>
            <li>
              <strong>Stream</strong> and download audio across all devices
              through web browser
            </li>
            <li>Support SSML script or text-only input file</li>
            <li>Free for all users</li>
          </ul>

          <!-- <p>
                  Traditional text-to-speech applications face challenges when
                  handling documents with unique formats like academic writings.
                  We design the app to solve the issue and provide a solution to
                  programmatically extract the texts that are suitable to read
                  aloud and convert them into an mp3 audio with a life-like
                  synthetic voice powered by Amazon Polly.
                </p> -->
          <div class="text-right mt-8">
            <v-btn large rounded color="primary" to="login"
              >Register & Get Started</v-btn
            >
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$fire.analytics.logEvent("page_view", {
      page_location: "https://paper2audio.netlify.app",
      page_path: "/",
      page_title: "landing",
    });
  },
  data: () => ({
    files: [],
  }),
};
</script>

<style>
.banner {
  background-image: url("~assets/banner.svg");
  background-repeat: no-repeat;
  background-position: center left;
}

.banner-function-list {
  list-style: none;
  padding-left: 0 !important;
}
.banner-function-list > li {
  line-height: 1.8;
}
.banner-function-list > li:before {
  content: "✓";
  color: green;
  padding-right: 9px;
}
#logo:hover::before {
  opacity: 0 !important;
}
#logo.v-btn--active::before {
  opacity: 0 !important;
}
</style>