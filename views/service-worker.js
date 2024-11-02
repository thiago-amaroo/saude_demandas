"use strict";

const CACHE_NAME = "saude-demandas";

const FILES_TO_CACHE = [

  "imgs/barra.png",
  "imgs/brasao.png",
  "imgs/praca-menor.jpg",
  //"icons/favicon.ico",
  "icons/152.png",
  
  // "imgs/offline.png",
  //"js/app.js",
  //"offline.html"
];

//Instalar Service Worker

self.addEventListener("install", (evt) => {

  console.log("Service Worker em instalação");

  evt.waitUntil(

    caches.open(CACHE_NAME).then((cache) => {

      console.log("Service Worker está adicionando o cache estático");
      return cache.addAll(FILES_TO_CACHE);

    })

  );
  self.skipWaiting();

});

//Ativando o Service Worker

self.addEventListener("activate", (evt) => {

  console.log("Service Worker em ativação");

  evt.waitUntil(

    caches.keys().then((keylist) => {

      return Promise.all(keylist.map((key) => {

        if(key !== CACHE_NAME){
          return caches.delete(key);
        }

      }));

    })

  );
  self.clients.claim();

});

//Responder página offline do app

self.addEventListener("fetch", (evt) => {

  if(evt.request.mode !== "navigate"){
    return;
  }

  evt.respondWith(

    fetch(evt.request).catch( async () => {

      return caches.open(CACHE_NAME).then((cache) =>{

        return cache.match("offline.html");

      });

    })

  );

});