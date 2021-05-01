<template>
  <v-card tile>
    <v-bottom-sheet v-model="expandDetails">
      <v-card class="px-4" tile>
        <div class="text-right py-4">
          <v-btn
            class="mr-3"
            color="primary"
            text
            @click="expandDetails = false"
          >
            Minimize
            <v-icon right>mdi-minus-circle-outline</v-icon>
          </v-btn>

          <v-btn class="mr-3" color="primary" text @click="closePlayer()">
            Close
            <v-icon right>mdi-close-circle-outline</v-icon>
          </v-btn>
        </div>

        <div id="progress-slider">
          <v-slider
            class="mt-16"
            v-model="currentTime"
            @click="seek()"
            min="0"
            :max="totalDuration"
            hide-details
            track-color="rgba(128, 128, 128, 0.3)"
            @mousedown="dragging_progress_bar = true"
            @mouseup="dragging_progress_bar = false"
          >
            <template v-slot:default>
              <h1>default slot</h1>
            </template>
          </v-slider>
        </div>

        <div
          :class="[
            'd-flex justify-space-between pl-2 pr-3 grey--text',
            { 'blue--text text--darken-4': dragging_progress_bar },
          ]"
        >
          <span>{{ currentTime_string }}</span>
          <span>{{ remainDuration_string }}</span>
        </div>

        <div class="text-center mt-12 mb-6">
          <h3>
            {{ getPlayingTrackInfo ? getPlayingTrackInfo.paper_title : "" }}
          </h3>
          <p class="grey--text body-2">
            {{ getPlayingTrackInfo ? getPlayingTrackInfo.file_name : "" }}
          </p>
        </div>

        <v-row class="justify-center">
          <v-col md="6" cols="12" class="text-center">
            <v-btn icon x-large @click.stop="rewind(30)">
              <v-icon>mdi-rewind-30</v-icon>
            </v-btn>
            <v-btn icon x-large @click.stop="togglePlay()">
              <v-icon> {{ isAudioPlaying ? "mdi-pause" : "mdi-play" }}</v-icon>
            </v-btn>
            <v-btn icon x-large @click.stop="fastForward(30)">
              <v-icon>mdi-fast-forward-30</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-row class="justify-center">
          <v-col id="volume-slider" md="4" cols="12" class="text-center">
            <v-slider
              v-model="volume"
              track-color="grey"
              color="grey"
              min="0"
              max="100"
            >
              <template v-slot:prepend>
                <v-icon>mdi-volume-low</v-icon>
              </template>

              <template v-slot:append>
                <v-icon>mdi-volume-high</v-icon>
              </template>
            </v-slider>
          </v-col>
        </v-row>
      </v-card>
    </v-bottom-sheet>

    <v-expand-transition>
      <div
        @click="expandDetails = true"
        v-show="!expandDetails"
        style="cursor: pointer"
      >
        <v-progress-linear
          :value="current_time_pct"
          :buffer-value="buffered_pct"
          class="my-0"
          height="4"
        ></v-progress-linear>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title
                class="font-weight-bold"
                v-text="
                  getPlayingTrackInfo ? getPlayingTrackInfo.paper_title : ''
                "
              >
              </v-list-item-title>
              <v-list-item-subtitle
                v-text="
                  getPlayingTrackInfo ? getPlayingTrackInfo.file_name : ''
                "
              >
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-spacer></v-spacer>

            <v-list-item-icon class="mr-3" @click.stop="rewind(30)">
              <v-btn icon large>
                <v-icon>mdi-rewind-30</v-icon>
              </v-btn>
            </v-list-item-icon>

            <v-list-item-icon @click.stop="togglePlay()" class="mr-3">
              <v-btn icon large>
                <v-icon>
                  {{ isAudioPlaying ? "mdi-pause" : "mdi-play" }}</v-icon
                >
              </v-btn>
            </v-list-item-icon>

            <v-list-item-icon
              class="ml-0"
              :class="{ 'mr-3': $vuetify.breakpoint.mdAndUp }"
              @click.stop="fastForward(30)"
            >
              <v-btn icon large>
                <v-icon>mdi-fast-forward-30</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";

function formatTime(second) {
  return second
    ? new Date(second * 1000).toISOString().substr(11, 8)
    : "00:00:00";
}

export default {
  beforeDestroy() {
    this.audio.removeEventListener("timeupdate", this._handleTimeupdate);
    this.audio.removeEventListener("loadeddata", this._handleLoaded);
    this.audio.removeEventListener("ended", this._handleEnded);
  },
  mounted() {
    this.audio = new Audio();

    this.audio.addEventListener("timeupdate", this._handleTimeupdate);
    this.audio.addEventListener("loadeddata", this._handleLoaded);
    this.audio.addEventListener("ended", this._handleEnded);
  },
  data() {
    return {
      audio: undefined,
      currentTime: 0,
      currentTime_string: "00:00:00",
      totalDuration: 0,
      totalDuration_string: "",
      expandDetails: false,
      buffered_pct: 0,
      dragging_progress_bar: false,
      volume: 50,
    };
  },
  computed: {
    ...mapState("dashboard", ["isAudioPlaying"]),
    ...mapGetters("dashboard", ["getPlayingTrackInfo"]),
    remainDuration() {
      return this.totalDuration - this.currentTime;
    },
    remainDuration_string() {
      return "- " + formatTime(this.remainDuration);
    },
    current_time_pct() {
      return Math.round((this.currentTime / this.totalDuration) * 100) || 0;
    },
  },
  methods: {
    ...mapMutations("dashboard", [
      "playAudio",
      "pauseAudio",
      "setAudioPlayer",
      "setPlayingTrack",
    ]),
    togglePlay() {
      if (this.isAudioPlaying) {
        this.pauseAudio();
      } else {
        this.playAudio();
      }
    },
    seek() {
      this.audio.currentTime = this.currentTime;
    },

    fastForward(sec) {
      if (sec >= this.remainDuration) {
        this.currentTime = this.totalDuration;
      } else {
        this.currentTime += sec;
      }
      this.seek();
    },
    rewind(sec) {
      if (sec >= this.currentTime) {
        this.currentTime = 0;
      } else {
        this.currentTime -= sec;
      }
      this.seek();
    },
    _handleTimeupdate() {
      if (!this.dragging_progress_bar) {
        this.currentTime = this.audio.currentTime;
      }

      // https://stackoverflow.com/questions/25651719/why-does-audio-buffered-end0-get-an-error-message-when-i-try-to-get-buffered-t
      if (this.audio.buffered.length > 0) {
        this.buffered_pct = Math.round(
          (this.audio.buffered.end(0) / this.totalDuration) * 100
        );
      }

      this.audio.volume = this.volume / 100;

      this.createVuetifySliderBufferTrack();

      let buffer_track = document.getElementById("buffer_track");
      if (buffer_track) {
        buffer_track.style.width = this.buffered_pct + "%";
      }
    },
    _handleLoaded() {
      if (this.audio.readyState >= 2) {
        this.totalDuration = parseInt(this.audio.duration);
        console.log(`audio loaded, duration is: ${this.totalDuration}`);
        this.playAudio();
      } else {
        throw new Error("Failed to load sound file");
      }
    },
    _handleEnded() {
      this.pauseAudio();
    },
    mountAudio() {
      this.audio.src = this.getPlayingTrackInfo.src;
      this.currentTime = 0;
    },
    createVuetifySliderBufferTrack() {
      let trackBar = document.querySelector(
        "#progress-slider .v-slider__track-fill"
      );
      let buffer_track = document.getElementById("buffer_track");
      if (trackBar & (buffer_track === null)) {
        // add buffer bar inside vuetify slider
        trackBar.insertAdjacentHTML(
          "beforebegin",
          '<div id="buffer_track" class="v-slider__track-fill grey lighten-1" style="left: 0px; right: auto;">'
        );
      }
    },
    closePlayer() {
      // pause audio
      this.pauseAudio();
      // set track to -1
      this.setPlayingTrack(-1);
      // hide player
      this.expandDetails = false;
      this.setAudioPlayer(false);
    },
  },
  watch: {
    dragging_progress_bar(val) {
      if (val == false) {
        this.seek();
      }
    },
    currentTime(val) {
      this.currentTime_string = formatTime(this.currentTime);
    },
    totalDuration(val) {
      this.totalDuration_string = formatTime(this.totalDuration);
    },
    "$store.state.dashboard.playing_track_index"(newVal, oldVal) {
      console.log(`changed track from ${oldVal} to: ${newVal}`);
      // if playing
      if (this.isAudioPlaying) this.pauseAudio();

      // change track -> trigger loadeddata event on audio object
      this.mountAudio();
    },
    // link audio obj play/pause to $store obj
    "$store.state.dashboard.isAudioPlaying"(playing) {
      if (playing) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    },
    // expandDetails(val) {
    //   console.log(val);
    // },
  },
};
</script>

<style lang="scss">
.v-ripple__container {
  display: none !important;
}
#progress-slider {
  // .v-slider__track-container {
  //   height: 5px !important;
  // }
}

.v-slider__thumb {
  cursor: pointer;
}
.v-slider__track-container {
  cursor: pointer;
}

#volume-slider {
}
</style>