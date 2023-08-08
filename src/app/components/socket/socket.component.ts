import { constants } from 'src/app/models/constants';
import { SocketService } from './../../services/socket.service';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.css']
})
export class SocketComponent implements OnDestroy {

  constructor(public socketService: SocketService) {}

  ngOnInit() {
    this.socketService.initCentrifugo()
    this.socketService.connect()
    this.socketService.subscribeChannel(constants.channelName)
  }

  ngOnDestroy() {
    this.socketService.unsubscribe()
  }

}
