import { constants } from 'src/app/models/constants';
import { CentrifugoService } from '../../services/centrifugo.service';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.css']
})
export class SocketComponent implements OnDestroy {

  textToSend:string =""

  constructor(public centrifugoService: CentrifugoService) { }

  ngOnInit() {
    this.centrifugoService.getTokens().then((res) => {
      this.centrifugoService.tokens = res;
    }).then(() => {
      this.centrifugoService.initCentrifugo()
      this.centrifugoService.connect()
      this.centrifugoService.subscribeChannel(constants.channelName)
    })
  }

  ngOnDestroy() {
    this.centrifugoService.unsubscribe()
    this.centrifugoService.centrifuge.removeSubscription(this.centrifugoService.sub)
  }


  sendData(){
    this.centrifugoService.centrifuge.publish(constants.channelName,this.textToSend).then(res=>{
      console.log(`Message sended to channel successfully`)
    }).catch(err=>{
      console.log(`couldnt send data to channel`)
    });
}
}
