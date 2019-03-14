import Vue from 'vue'

const state = {
  detection: [],
}

const mutations = {
  PUSH_DETECTION(state, array) {
    state.detection.push(array)
  },
  INSERT_DETECTION(state, { array, index }) {
    // Vue.set(state.detection, index, array)
    state.detection[index - 1] = array
  },
  SET_DETECTION(state, array) {
    state.detection = array
  },
}

const actions = {
  pushDetection({ commit }, array) {
    commit('PUSH_DETECTION', array)
  },
  insertDetection({ commit }, { array, index }) {
    commit('INSERT_DETECTION', { array, index })
  },
  setDetection({ commit }, array) {
    commit('SET_DETECTION', array)
  },
}

export default {
  state,
  mutations,
  actions,
}
