import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectedObject } from '@tensorflow-models/coco-ssd';
import { environment } from './../environments/environment.prod';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  model: cocoSsd.ObjectDetection;
  @ViewChild('videoRef', {static: true}) videoRef: ElementRef<HTMLVideoElement>;
  @ViewChild('svgRef', {static: true}) svgRef: ElementRef<SVGElement>;

  currentDetections: DetectedObject[];

  videoWidth = 320;  // 1028
  videoHeight = 180; // 720
  demoVideoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';
  videoBoundingRect;
  svgEnabled = true;

  // Debug
  debug = false;
  elementWidth: number;
  elementHeight: number;
  intrinsicWidth: number;
  intrinsicHeight: number;
  aspectRatio: number;

  constructor(private cdRef: ChangeDetectorRef) {
    if ( !environment.production ) {
      this.debug = true;
    }
  }

  async ngOnInit() {
    this.model = await cocoSsd.load({base: 'lite_mobilenet_v2'});
    this.videoRef.nativeElement.onloadeddata = async () => {
      // TODO: Check?
      if ( !environment.production ) {
        console.log('video.loaded');
      }
    };
    await this.detectFrame();
    await this.videoRef.nativeElement.play();
  }

  async onVideoCanPlay() {
    this.videoBoundingRect = this.videoRef.nativeElement.getBoundingClientRect();

    this.elementWidth = this.videoRef.nativeElement.width;
    this.elementHeight = this.videoRef.nativeElement.height;
    this.intrinsicWidth = this.videoRef.nativeElement.videoWidth;
    this.intrinsicHeight = this.videoRef.nativeElement.videoHeight;
    this.aspectRatio = this.intrinsicWidth / this.elementWidth;
  }

  async detectFrame() {

    if (this.model) {
        const currentDetections = await this.model.detect(this.videoRef.nativeElement);
        this.currentDetections = currentDetections.map( detection => {
          detection.bbox[0] = detection.bbox[0] / this.aspectRatio;
          detection.bbox[1] = detection.bbox[1] / this.aspectRatio;
          detection.bbox[2] = detection.bbox[2] / this.aspectRatio;
          detection.bbox[3] = detection.bbox[3] / this.aspectRatio;
          return detection;
        });
        this.cdRef.markForCheck();
        requestAnimationFrame(async () => {
          await this.detectFrame();
        });
    }
  }

  toggleSvgOverlay() {
    this.svgEnabled = !this.svgEnabled;
  }

}
