
import { firestoreAction } from 'vuexfire'

export const strict = false;


export const state = () => ({
    showPlayer: false,
    playing_track_index: -1,
    isAudioPlaying: false,
    garbage: [
        {
            file_name:
                "U-Net: Going Deeper with Nested U-Structure for Salient Object Detection.pdf",
            audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            status: 2,
            uploaded_at: "1611902133055",
            audio_file_size: "120",
        }
    ],
    playlist: []
});

export const getters = {
    getPlayingTrackInfo(state) {
        if (state.playing_track_index != -1) {
            let track = state.playlist.find(track => track.id == state.playing_track_index)
            return {
                file_name: track.file_name,
                paper_title: track.paper_title,
                src: track.audio_stream_url
            }
        }
        return null
    }
}

export const mutations = {
    setAudioPlayer(state, val) {
        state.showPlayer = val
    },
    setPlayingTrack(state, track_index) {
        state.playing_track_index = track_index;
    },
    playAudio(state, url) {
        state.isAudioPlaying = true
        console.log("audio started")
    },
    pauseAudio(state) {
        state.isAudioPlaying = false
        console.log("audio paused")
    },
}


export const actions = {
    bindPlaylist: firestoreAction(async function ({ rootState, bindFirestoreRef }) {
        const ref = this.$fire.firestore.collection(`users/${rootState.auth.user.uid}/paper`)
        // context contains all original properties like commit, state, etc
        // and adds `bindFirestoreRef` and `unbindFirestoreRef`
        // we return the promise returned by `bindFirestoreRef` that will
        // resolve once data is ready
        await bindFirestoreRef('playlist', ref, { wait: true })
    }),
    unbindPlaylist: firestoreAction(function ({ unbindFirestoreRef }) {
        unbindFirestoreRef('playlist', false)
    }),
};