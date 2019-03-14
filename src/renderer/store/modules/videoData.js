const state = {
  videoName: '',
  frameCount: 0,
}

const mutations = {
  SET_FRAMECOUNT(state, count) {
    state.frameCount = count
  },
  SET_VIDEONAME(state, videoName) {
    state.videoName = videoName
  },
}

const actions = {
  setFrameCount({ commit }, count) {
    commit('SET_FRAMECOUNT', count)
  },
  setVideoName({ commit }, videoName) {
    commit('SET_VIDEONAME', videoName)
  },
}

export default {
  state,
  mutations,
  actions,
}
