<script setup>
import Header from '/src/components/Header.vue'

</script>
<script >

export default {
    data() {
        return {
            slideIndex: 0,
            numberSlides: 8,
        }
    },
    methods: {
        previousSlide() {
            if (this.slideIndex > 0)
                this.slideIndex -= 1
        },
        nextSlide() {
            if (this.slideIndex < (this.numberSlides - 1))
                this.slideIndex += 1
        },
        handleKeyDown(event) {
            if (event.key == "d" || event.key == "ArrowRight") {
                if (this.slideIndex < (this.numberSlides - 1))
                    this.slideIndex += 1
            }
            if (event.key == "a" || event.key == "ArrowLeft") {
                if (this.slideIndex > 0)
                    this.slideIndex -= 1
            }
        },
    },
    created() {
        window.addEventListener('keydown', this.handleKeyDown);
    },
}
</script>

<template>
    <Header />
    <main role="main">
        <div v-if="slideIndex == 0">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" disabled style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">Welcome to Tiny Elite Dangerous</h1>
                        <h2 class="text-white mt-5">A tiny implementation of Elite Dangerous using Vue.js and Tinybird</h2>
                        <h2 class="text-white mb-5">for the To Infinity and Beyond Hackathon 2022</h2>
                        <h4 class="text-white my-5">by AlfVII <a href="https://github.com/AlfVII/TinyEliteDangerous"> <i class="mx-1 fa-brands fa-github bd-placeholder-img rounded-circle text-primary" width="140" height="140" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false"></i> </a> </h4>

                        <img src="/images/logo.webp" width="500" height="438" class="mr-2" alt="Logo">
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="slideIndex == 1">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">Why Tiny Elite Dangerous? I</h1>
                        <p style="text-align: justify;" class="text-white my-1 fs-3">When I heard about the theme of the Hackathon, the first thing that came to my mind about Space was its origin, the place where humanity first soared the stars:</p>
                        <p style="text-align: justify;" class="text-white my-2 fs-2">Science Fiction.</p>
                        <div class="row">
                            <div Class="my-1 col-lg-9">
                                <p style="text-align: justify;" class="text-white fs-3">Because for those who believed Science Fiction is some modern geek fad, I must tell you that is quite older than your "Magic Realism". </p>
                                <p style="text-align: justify;" class="text-white fs-3"> For the topic at hand, the Space, the first novel that is known is <a href="https://www.goodreads.com/book/show/1156110.Micromegas">"Le Micromégas"</a>in 1752, by Voltaire. Yes, that <a href="https://en.wikipedia.org/wiki/Voltaire">Voltaire</a>. </p>
                            </div>
                            <img src="/images/Voltaire_micromegas.jpg" style="height: 20%; width: 20%"  class="mr-2 col-lg-2" alt="Logo">
                        </div>
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="slideIndex == 2">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">Why Tiny Elite Dangerous? II</h1>
                        <p style="text-align: justify;" class="text-white my-1 fs-3">And being the gamer I am, I directly went to the best Space simulator I know of: <a href="https://www.elitedangerous.com">Elite Dangerous</a></p>
                        <div class="row">
                            <div class="my-1 col-lg-6">
                                <p style="text-align: justify;" class="text-white fs-3">Elite Dangerous is a space flight simulation game developed and published by Frontier Developments. The player takes the role of a pilot of a spaceship, and explores a realistic 1:1 scale open-world representation of the Milky Way galaxy.</p>
                                <p style="text-align: justify;" class="text-white fs-3">It currently has <a href="https://www.edsm.net">76 millions systems, 373 millions celestial bodies</a>, all of them kept updated with the latest information from NASA and ESA, to be as real as possible. </p>
                            </div>
                            <div class="my-1 col-lg-6">
                                 <div class="row">
                                    <img src="/images/elite.webp" style="height: 50%; width: 100%"  class="mt-1 col-lg-12" alt="Logo">
                                    <img src="/images/elite2.jpg" style="height: 50%; width: 100%"  class="mt-1 col-lg-12" alt="Logo">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="slideIndex == 3">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">Tinybird? are you a Sirius fowl?</h1>
                        <p style="text-align: justify;" class="text-white my-1 fs-3">I am not really sure how you could have arrived here without knowing <a href="https://tinybirdgarden.fandom.com/wiki/Tiny_Bird_Garden_Wiki">Tinybird</a>, but just in case:</p>
                        <p style="text-align: justify;" class="text-white my-1 fs-3">Tinybird is the serverless analytical backend for building data features. Ingest your data, shape it with SQL, and publish the results as low-latency APIs in a single click.</p>
                        <img src="/images/tiny.png" style="height: 400px; width: auto"  class="my-3" alt="ted1 ">
                        <p style="text-align: justify;" class="text-white my-1 fs-3"><a href="https://ui.tinybird.co/signup">Try it!</a> you can even make videogames with it!.</p>
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="slideIndex == 4">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">First version</h1>
                        <p style="text-align: justify;" class="text-white my-1 fs-3" >My first idea was to create a simulation of all the systems in Elite Dangerous, allowing the user to travel the constellations.</p>
                        <p style="text-align: justify;" class="text-white my-1 fs-3">From the technical point of view, the stars were rendered in the browser using Three.js, and Vue for the controls and reactivity.</p>
                        <p style="text-align: justify;" class="text-white my-1 fs-3">The system data would be loaded into a Data Source in Tinybird and the Vue components would ask for the nearby stars as the user surfed the stars.</p>
                        <img src="/images/ted1.webp" style="height: 400px; width: auto"  class="mt-1" alt="ted1 ">
                        <p style="text-align: justify;" class="text-danger my-1 fs-3">Although there were 76 million stars, this was not really a challenge for Tinybird.</p>
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="slideIndex == 5">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">Second version</h1>
                        <p style="text-align: justify;" class="text-white my-1 fs-3" >After that I thought I could expand the exploration to the systems themselves.</p>
                        <p style="text-align: justify;" class="text-white my-1 fs-3">The user would be able to visit any system in the galaxy, loading the celestial bodies from another Data Source in Tinybird using directly the API at system entrance, and fly around, visiting the different planets, trying not to crash into them.</p>
                        <img src="/images/ted2.webp" style="height: 400px; width: auto"  class="mt-1" alt="ted1 ">
                        <p style="text-align: justify;" class="text-danger my-1 fs-3">Still this was nothing for Tinybird.</p>
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="slideIndex == 6">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">Third version</h1>
                        <p style="text-align: justify;" class="text-white my-1 fs-4">But then the muses smiled on me and thought: let’s make it multiplayer! So if two or more players were together in a system they could explore it together, seeing each other, which was already better than No Man’s Sky!</p>
                        <p style="text-align: justify;" class="text-white my-1 fs-4">This implied that each player is constantly sending their position to a DS through TInybird’s HFI, and the rest of the players would be querying the last two timestamped positions (in order to calculate speed and directional vector) of all the other players in the system.</p>
                        <p style="text-align: justify;" class="text-white my-1 fs-4">And to make this fluid, this data exchange has to be done several times per second, ideally under 100 ms of latency. This looked like something where Tinybird could shine. And did shine.</p>
                        <img src="/images/ted3.webp" style="height: 400px; width: auto"  class="mt-1" alt="ted1 ">
                        <p style="text-align: justify;" class="text-success my-1 fs-3">And did shine.</p>
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="slideIndex == 7">
            <div class="container">
                <div class="row">
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" style="height: 90vh; width: 100%" @click="previousSlide">Previous</button>
                    </div>
                    <div class="col-lg-10 text-center">
                        <h1 class="text-white my-5">And finally...</h1>
                        <h1 class="text-white my-5">Ready to play?!</h1>

                        <router-link class="nav-link text-light bg-primary float-end fs-1 mt-5" to="/game" style="height: 7vh; width: 100%">Start new game!</router-link>
                    </div>
                    <div class="col-lg-1">
                        <button class="btn text-primary bg-dark" disabled style="height: 90vh; width: 100%" @click="nextSlide">Next</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
