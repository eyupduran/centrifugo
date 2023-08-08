import { TokenModel } from './../models/tokenModel';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constants } from '../models/constants';
import { Centrifuge, Subscription } from 'centrifuge';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SocketService {

  constructor(private http:HttpClient) { }
  
  tokens:TokenModel

  apiUrl : "http://localhost:6060/"
  messages: Array<string> = []

  connectionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OSJ9.FB6k1LtXAGCu2nNJ0s9OJZ2zijmXDgSPrsJxBFqEJac'
  subscriptionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsIjoicHVibGljOmRlbmVtZSIsImV4cCI6ODg4ODg4ODg4ODg4ODg4ODg4LCJzdWIiOiI5OSJ9.AvEx0nJ7fJ-85vHDKTtK_pV3JMv2j5-cWFj1BqNvwcs'
  channelName: 'public:deneme'

  public centrifuge: Centrifuge;
  public sub: Subscription


  initCentrifugo() {
    this.getTokens(constants.channelName,"999")
    this.centrifuge = new Centrifuge("wss://ct.easymakecash.com/connection/websocket", {
      token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5OSJ9.FB6k1LtXAGCu2nNJ0s9OJZ2zijmXDgSPrsJxBFqEJac"
    });
    this.centrifuge.on('connecting', function (ctx) {
      console.log(`connecting: ${ctx.code}, ${ctx.reason}`);

    }).on('connected', function (ctx) {
      console.log(`connected over ${ctx.transport}`);
    }).on('disconnected', function (ctx) {
      console.log(`disconnected: ${ctx.code}, ${ctx.reason}`);
    })
  }

  subscribeChannel(channel: string) {
    this.sub = this.centrifuge.newSubscription(channel,
      { token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsIjoicHVibGljOmRlbmVtZSIsImV4cCI6ODg4ODg4ODg4ODg4ODg4ODg4LCJzdWIiOiI5OSJ9.AvEx0nJ7fJ-85vHDKTtK_pV3JMv2j5-cWFj1BqNvwcs',});

    const callbacks = {
      "join": (ctx: any) => this.handleJoin(channel, ctx),
      "publication": (ctx: any) => this.handlePublication(channel, ctx),
      "subscribing": (ctx: any) => this.handleSubscribing(channel, ctx),
      "subscribed": (ctx: any) => this.handleSubscribed(ctx),
      "unsubscribed": (ctx: any) => this.handleUnsubscribe(ctx),
    }
    
    this.sub.on('join', callbacks.join)
    this.sub.on('publication', callbacks.publication)
    this.sub.on('subscribing', callbacks.subscribing)
    this.sub.on('subscribed', callbacks.subscribed)
    this.sub.on('unsubscribed', callbacks.unsubscribed)
    this.sub.subscribe();
  }

  handleJoin(channel: string, ctx: any) {
    console.log("Someone joined ", channel ,"User:", ctx.info)
  }

  handlePublication(channel: string, ctx: any) {
    console.log("Someone send message to ", channel  ," User:", ctx.info)
    this.messages.push(ctx.data.input)
  }

  handleSubscribing(channel: string, ctx: any) {
    console.log("Someone subsribing to ", channel  ," User:", ctx.info)
  }

  handleSubscribed(ctx: any) {
    console.log(ctx," subscribed to ", ctx.channel)
  }

  handleUnsubscribe(ctx: any) {
    console.log(ctx)
  }

  connect() {
    this.centrifuge.connect();
  }

  disconnect() {
    this.centrifuge.disconnect();
  }

  unsubscribe() {
    this.sub.unsubscribe();
  }

  getTokens(channel:string,user:string){
      let body = {channel,user}
      const newPath  =  "http://localhost:6060/connect"
       this.http.post<TokenModel>(newPath,body).subscribe(res=>{
        this.tokens = res
      })
      return this.tokens
  }

  getConnectionToken(): string {
    return this.connectionToken
  }

  getSubscriptionToken(): string {
    return this.subscriptionToken
  }
}
