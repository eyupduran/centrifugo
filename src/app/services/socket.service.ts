import { environment } from 'src/environments/environment';
import { TokenModel } from './../models/tokenModel';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Centrifuge,
  Subscription,
} from 'centrifuge';
import { Observable } from 'rxjs';
import { constants } from '../models/constants';

@Injectable({
  providedIn: 'root',
})
export class SocketService {

  tokens: TokenModel;
  apiUrl:string= `${environment.apiUrl}`;
  
  messages: Array<string> = [];
  
  channelName: 'public:deneme';
  
  public centrifuge: Centrifuge;
  public sub: Subscription;
  
  constructor(private http: HttpClient) { }
  
  initCentrifugo() {

    this.centrifuge =  new Centrifuge(
      constants.centrifugoURL,
      {
           token:this.tokens.connection_token
      }
    );
    this.centrifuge
      .on('connecting', function (ctx) {
        console.log(`connecting: ${ctx.code}, ${ctx.reason}`);
      })
      .on('connected', function (ctx) {
        console.log(`connected over ${ctx.transport}`);
      })
      .on('disconnected', function (ctx) {
        console.log(`disconnected: ${ctx.code}, ${ctx.reason}`);
      });
  }

  subscribeChannel(channel: string, ) {
    this.sub = this.centrifuge.newSubscription(channel, {
       token:this.tokens.subscription_token
    });

    const callbacks = {
      join: (ctx: any) => this.handleJoin(channel, ctx),
      publication: (ctx: any) => this.handlePublication(channel, ctx),
      subscribing: (ctx: any) => this.handleSubscribing(channel, ctx),
      subscribed: (ctx: any) => this.handleSubscribed(ctx),
      unsubscribed: (ctx: any) => this.handleUnsubscribe(ctx),
    };

    this.sub.on('join', callbacks.join);
    this.sub.on('publication', callbacks.publication);
    this.sub.on('subscribing', callbacks.subscribing);
    this.sub.on('subscribed', callbacks.subscribed);
    this.sub.on('unsubscribed', callbacks.unsubscribed);
    this.sub.subscribe();
  }
  
  handleJoin(channel: string, ctx: any) {
    console.log('Someone joined ', channel, 'User:', ctx.info);
  }

  handlePublication(channel: string, ctx: any) {
    console.log('Someone send message to ', channel, ' User:', ctx.info);
    this.messages.push(ctx.data.input);
  }

  handleSubscribing(channel: string, ctx: any) {
    console.log('Someone subsribing to ', channel, ' User:', ctx.info);
  }

  handleSubscribed(ctx: any) {
    console.log(ctx, ' subscribed to ', ctx.channel);
  }

  handleUnsubscribe(ctx: any) {
    console.log(ctx, ' unsubscribed from ', ctx.channel);
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

  getTokens(): Promise<TokenModel> {
    return new Promise((resolve, reject) => {
      this.tokenRequest().subscribe(
        (res) => {
          resolve(res);
        },
        (err) => {
          console.error(`connection tokeni alınırken hata: ${err}`);
          reject(err);
        }
      );
    });
  }

  tokenRequest(): Observable<TokenModel> {
    const body = { channel: constants.channelName, user: '78787788787' };
    const url = this.apiUrl+"tokens";
    return this.http.post<TokenModel>(url, body,{});
  }

}
