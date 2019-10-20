import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import {DetectedObject} from '@tensorflow-models/coco-ssd';

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

  videoBoundingRect;
  svgEnabled = true;
  // Debug
  elementWidth: number;
  elementHeight: number;
  videoWidth: number;
  videoHeight: number;

  constructor(private cdRef: ChangeDetectorRef) {

  }

  async ngOnInit() {
    this.model = await cocoSsd.load({base: 'lite_mobilenet_v2'});
    await this.detectFrame();
    await this.videoRef.nativeElement.play();
  }

  async onVideoCanPlay() {
    this.videoBoundingRect = this.videoRef.nativeElement.getBoundingClientRect();
    this.elementWidth = this.videoRef.nativeElement.width;
    this.elementHeight = this.videoRef.nativeElement.height;
    this.videoWidth = this.videoRef.nativeElement.videoWidth;
    this.videoHeight = this.videoRef.nativeElement.videoHeight;
  }

  async detectFrame() {

    if (this.model) {
        const currentDetections = await this.model.detect(this.videoRef.nativeElement);
        this.currentDetections = currentDetections.map( detection => {
          detection.bbox[0] = detection.bbox[0] / 4;
          detection.bbox[1] = detection.bbox[1] / 4;
          detection.bbox[2] = detection.bbox[2] / 4;
          detection.bbox[3] = detection.bbox[3] / 4;
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
