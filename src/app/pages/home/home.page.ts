import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AnimationController} from '@ionic/angular';
import { Usuario } from 'src/app/model/Usuario';
import { Asistencia } from 'src/app/model/asistencia';
import jsQR, { QRCode } from 'jsqr';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {

  @ViewChild('titulo', { read: ElementRef }) itemTitulo!: ElementRef;
    @ViewChild('video')
  private video!: ElementRef;

  @ViewChild('canvas')
  private canvas!: ElementRef;

  public asistencia: Asistencia = new Asistencia();
  public escaneando = false;
  public datosQR: string = '';
  public usuario: Usuario;
  constructor(
        private activeroute: ActivatedRoute // Permite obtener los parámetros de la página login
      , private router: Router // Permite navegar entre páginas
      , private alertController: AlertController // Permite mostrar mensajes emergentes más complejos que Toast
      , private animationController: AnimationController) { // Permite crear animaciones con  

    this.usuario = new Usuario('', '', '', '', '', '',);

    // Se llama a la ruta activa y se obtienen sus parámetros mediante una subscripcion
    this.activeroute.queryParams.subscribe(params => { 

      const nav = this.router.getCurrentNavigation();
      if (nav) {
        // Si tiene datos extra, se rescatan y se asignan a una propiedad
        if (nav.extras.state) {
          this.usuario = nav.extras.state['usuario'];
          
          return;
        }
      }
      // Si no vienen datos extra desde la página anterior, quiere decir que el usuario
      // intentó entrar directamente a la página home sin pasar por el login,
      // de modo que el sistema debe enviarlo al login para que inicie sesión.
      this.router.navigate(['/login']);

    });
  }
  public animateItem(elementRef: any) {
    this.animationController
      .create()
      .addElement(elementRef)
      .iterations(1)
      .duration(600)
      .fromTo('transform', 'translate(100%)', 'translate(0%)')
      .play();
  }


  public ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
    if (this.itemTitulo) {
      const animation = this.animationController
        .create()
        .addElement(this.itemTitulo.nativeElement)
        .iterations(1)
        .duration(3000)
        .fromTo('transform', 'translate(0%)', 'translate(45%)')
        .fromTo('opacity', 0.2, 1);

      animation.play();
    }
  }


  // Se va a solicitar el uso de la cámara, por medio de "navigator.mediaDevices.getUserMedia".
  // La cámara es necesaria para poder capturar el Código QR.
  // Luego se cofigurará:
  //     this.video.nativeElement.setAttribute('playsinline', 'true');
  // que permite que el video se reproduzca dentro del contexto de la página, en lugar de
  // cambiar automáticamente al modo de pantalla completa en dispositivos iOS. 
  // Esto sirve para proporcionar una experiencia de usuario más fluida y evitar 
  // interrupciones al reproducir videos en el sitio web. Luego se iniciará el proceso de
  // escaneo indicándolo por medio de la variable "this.escaneando = true;" y se podrá detener 
  // el escaneo por medio del botón de "Detener" que cambia a "this.escaneando = false;" o bien
  // si la cámara detecta un código QR.

  public async comenzarEscaneoQR() {
    const mediaProvider: MediaProvider = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: 'environment'}
    });
    this.video.nativeElement.srcObject = mediaProvider;
    this.video.nativeElement.setAttribute('playsinline', 'true');
    this.video.nativeElement.play();
    this.escaneando = true;
    requestAnimationFrame(this.verificarVideo.bind(this));
  }

  // Las imágenes de la cámara se analizan muchas veces, hasta que logre encontrar un Código QR,
  // por esta razón se usa la función del navegador "requestAnimationFrame", que permite realizar
  // actualizaciones de la interfaz de usuario de manera eficiente y sincronizada con los 
  // refrescos de la pantalla. Entonces, en cada refresco de pantalla el programa realizará una
  // pequeña pausa para analizar si el fotograma capturado es o no un Código QR, por medio de
  // la función this.obtenerDatosQR().

  async verificarVideo() {
    if (this.video.nativeElement.readyState === this.video.nativeElement.HAVE_ENOUGH_DATA) {
      if (this.obtenerDatosQR() || !this.escaneando) return;
      requestAnimationFrame(this.verificarVideo.bind(this));
    } else {
      requestAnimationFrame(this.verificarVideo.bind(this));
    }
  }

  // Si "obtenerDatosQR" encuentra un QR válido entonces se mostrarán los datos en pantalla
  // y se devolverá true para detener el escaneo. En caso contrario, mientras no se detecte
  // un QR, la función "obtenerDatosQR" devolverá false y el método "verificarVideo" se 
  // volverá a ejecutar nuevamente.
  // Para analizar la imagen se usan los Elementos HTML: video y canvas. El TAG HTML "video"
  // sirve para establecer un recuadro en la pantalla donde se visualiza el video de la 
  // cámara. Cada fotograma de la cámara es redibujado dentro del TAG HTML "canvas", 
  // de modo que es la imagen del canvas, la que analiza la biblioteca "jsQR". 

  public obtenerDatosQR(): boolean {
    const w: number = this.video.nativeElement.videoWidth;
    const h: number = this.video.nativeElement.videoHeight;
    this.canvas.nativeElement.width = w;
    this.canvas.nativeElement.height = h;
    const context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    context.drawImage(this.video.nativeElement, 0, 0, w, h);
    const img: ImageData = context.getImageData(0, 0, w, h);
    let qrCode: QRCode | null = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
    if (qrCode) {
      if (qrCode.data !== '') {
        this.escaneando = false;
        this.mostrarDatosQROrdenados(qrCode.data);
        return true;
      }
    }
    return false;
  }

  public mostrarDatosQROrdenados(datosQR: string): void {
    this.datosQR = datosQR;
    const objetoDatosQR = JSON.parse(datosQR);
    // ----------------------------------
    // TAREA PARA COMPLETAR POR EL ALUMNO
    // ----------------------------------
    // 1) Ejecutar el setter de la clase Asistencia:
    //     this.asistencia.setAsistencia(...parametros...)
    //    de modo que los parámetros los tome del objeto datosQR,
    //    por ejemplo: datosQR.nombreAsignatura contiene el valor 
    //    del nombre de la asignatura en la cual el alumno
    //    debe quedar presente.
    // 2) Hacer una interpolación entre las propiedades 
    //    de "this.asistencia" y la página HTML, de modo
    //    que la página muestre de manera ordenada estos datos.
  }

  // Si la propiedad this.escaneando cambia a false, entonces la función
  // "verificarVideo" deja de ejecutarse y se detiene el escaneo del QR.

  public detenerEscaneoQR(): void {
    this.escaneando = false;
  }

}
