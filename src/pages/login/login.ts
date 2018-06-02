import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, Platform, ToastController} from 'ionic-angular';
import Parse from 'parse';
import {Facebook} from "@ionic-native/facebook";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  username: string;
  password: string;
  email: string;
  isSigningup: boolean;

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public facebook: Facebook,
  ) {

  }

  signUp() {
    Parse.User.signUp(this.username, this.password, {email: this.email}).then((resp) => {
      console.log('Signed up successfully', resp);

      // Clears up the form
      this.username = '';
      this.password = '';
      this.email = '';

      this.toastCtrl.create({
        message: 'Account created successfully',
        duration: 2000
      }).present();

      this.isSigningup = false;
    }, err => {
      console.log('Error signing in', err);

      this.toastCtrl.create({
        message: err.message,
        duration: 2000
      }).present();
    });
  }

  signIn() {
    Parse.User.logIn(this.username, this.password).then((user) => {
      console.log('Logged in successfully', user);

      if(user.get('emailVerified')) {
        // If you app has Tabs, set root to TabsPage
        this.navCtrl.setRoot('HomePage')
      } else {
        Parse.User.logOut().then((resp) => {
          console.log('Logged out successfully', resp);
        }, err => {
          console.log('Error logging out', err);
        });

        this.alertCtrl.create({
          title: 'E-mail verification need',
          message: 'Your e-mail address must be verified before logging in.',
          buttons: ['Ok']
        }).present();
      }
    }, err => {
      console.log('Error logging in', err);

      this.toastCtrl.create({
        message: err.message,
        duration: 2000
      }).present();
    });
  }

  async facebookLogin() {
    try {
      let facebookResponse = await this.facebook.login(['public_profile', 'email']);
      let facebookAuthData = {
        id: facebookResponse.authResponse.userID,
        access_token: facebookResponse.authResponse.accessToken,
      };
      let toLinkUser = new Parse.User();
      let user = await toLinkUser._linkWith('facebook', {authData: facebookAuthData});
      if (!user.existed()) {
        let userData = await this.facebook.api('me?fields=id,name,email,first_name,picture.width(720).height(720).as(picture)', []);
        user.set('username', userData.name);
        user.set('name', userData.name);
        user.set('email', userData.email);
        await user.save();
      }
      this.navCtrl.setRoot('HomePage');
    } catch (err) {
      this.toastCtrl.create({
        message: err.message,
        duration: 2000
      }).present();
    }
  }
}
