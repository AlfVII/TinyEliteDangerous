<script setup lang="ts">
import { Form } from 'vee-validate';
import * as Yup from 'yup';
import TextInput from './TextInput.vue';
const emit = defineEmits(['onPlayerReady'])

function onSubmit(values) {
    console.log(values)
    emit('onPlayerReady', values)
  // alert(JSON.stringify(values, null, 2));
}

function onInvalidSubmit() {
  const submitBtn = document.querySelector('.submit-btn');
  submitBtn.classList.add('invalid');
  setTimeout(() => {
    submitBtn.classList.remove('invalid');
  }, 1000);
}

// Using yup to generate a validation schema
// https://vee-validate.logaretm.com/v4/guide/validation#validation-schemas-with-yup
const schema = Yup.object().shape({
  name: Yup.string().required(),
});
</script>

<template>

    <div class="container">
        <div class="row">
            <div class="col-lg-1">
            </div>
            <div class="col-lg-10 text-center">
                <h1 class="text-white my-5">Welcome to Tiny Elite Dangerous</h1>
                <h2 class="text-white my-5">A tiny implementation of Elite Dangerous using Vue.js and Tinybird</h2>
                <h4 class="text-white my-5">by <a href="https://github.com/AlfVII/TinyEliteDangerous">AlfVII </a> </h4>
                <img src="/images/logo.webp" width="30%" height="auto" href="/" class="d-inline-block align-top mr-2" alt="">
            </div>
            <div class="col-lg-1">
            </div>
        </div>
    </div>
    <Form class="mt-4" @submit="onSubmit" :validation-schema="schema" @invalid-submit="onInvalidSubmit"> 
        <TextInput name="name" type="text" label="Introduce your name, Commander" placeholder="Your Name" success-message="Nice to meet you!"/>
        <div class="d-flex justify-content-center">
            <button class="btn text-primary bg-light submit-btn" type="submit">Launch!</button>
        </div>
    </Form>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;

  width: 100%;
  height: 100%;
}

form {
  width: 50vw;
  margin: 0px auto;
  padding-bottom: 60px;
}

.submit-btn {
  background: var(--primary-color);
  outline: none;
  border: none;
  font-size: 18px;
  padding: 10px 15px;
  display: block;
  width: 50%;
  border-radius: 7px;
  margin-top: 40px;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.submit-btn.invalid {
  animation: shake 0.5s;
  /* When the animation is finished, start again */
  animation-iteration-count: infinite;
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px);
  }
  10% {
    transform: translate(-1px, -2px);
  }
  20% {
    transform: translate(-3px, 0px);
  }
  30% {
    transform: translate(3px, 2px);
  }
  40% {
    transform: translate(1px, -1px);
  }
  50% {
    transform: translate(-1px, 2px);
  }
  60% {
    transform: translate(-3px, 1px);
  }
  70% {
    transform: translate(3px, 1px);
  }
  80% {
    transform: translate(-1px, -1px);
  }
  90% {
    transform: translate(1px, 2px);
  }
  100% {
    transform: translate(1px, -2px);
  }
}

.submit-btn:hover {
  transform: scale(1.1);
}
</style>