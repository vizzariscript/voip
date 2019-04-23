import { Component } from '@angular/core';

//jssip
import * as Jssip from 'jssip'
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  //JSSIP
  public socket;
  public configuration;
  public session;
  public callSession;
  public myLoader = null;


  //ESTADOS
  public status: any = {
    calling: false,
    callConfirmed: false,
    callFailed: false,
    callEnded: false
  }

  constructor(private loaderCtrl: LoadingController) {
    this.registerUserAgentConfiguration();
  }

  async presentLoading() {
    this.myLoader = await this.loaderCtrl.create({
      message: 'Calling...',
    });
    await this.myLoader.present();
  }


  call(callTo: string) {

    console.log('Comienza metodo call()');
    // Register callbacks to desired call events
    let eventHandlers = {
      'progress': function (data) {
      },
      'failed': function (data) {
      },
      'confirmed': function (data) {
      },
      'ended': function (data) {
      },
    };

    let options = {
      'eventHandlers': eventHandlers,
      'mediaConstraints': { 'audio': true, 'video': false }
    }

    console.log("Empieza LLamada -> call()");
    //LLAMADA AQUI
    this.callSession = this.session.call('sip:' + callTo, options);

    this.callSession.on('progress', () => {
      this.presentLoading();
      this.status.calling = true;
      this.status.callConfirmed = false;
      this.status.callFailed = false;
      this.status.callEnded = false;

    });
    this.callSession.on('failed', () => {
      this.myLoader ? this.myLoader.dismiss() : null;

      this.status.calling = false;
      this.status.callConfirmed = false;
      this.status.callFailed = true;
      this.status.callEnded = false;

    });
    this.callSession.on('confirmed', () => {
      this.myLoader ? this.myLoader.dismiss() : null;

      this.status.calling = false;
      this.status.callConfirmed = true;
      this.status.callFailed = false;
      this.status.callFailed = false;
    });
    this.callSession.on('ended', () => {
      this.myLoader ? this.myLoader.dismiss() : null;

      this.status.calling = false;
      this.status.callConfirmed = false;
      this.status.callFailed = false;
      this.status.callEnded = true;
    });
    // console.log(this.callSession);

  }

  setProgress() {
    console.log('this llegueeee', this);
  }

  registerUserAgentConfiguration() {
    this.socket = new Jssip.WebSocketInterface('wss://sip.iptel.org:8081');
    this.configuration = {
      sockets: [this.socket],
      uri: 'sip:mmarelli@iptel.org',
      password: 'Copado156'
    };

    this.session = new Jssip.UA(this.configuration);
    this.session.start();
    this.newRtcSession(this.session);

  }

  newRtcSession(rtcSession) {
    rtcSession.on('newRTCSession', function (data) {
      this.newRtcSession = data.session;

      this.newRtcSession.connection.addEventListener('addstream', (event: any) => {
        let audio_session = new Audio();
        audio_session.srcObject = event.stream
        audio_session.play()
      })

    });
  }

}
