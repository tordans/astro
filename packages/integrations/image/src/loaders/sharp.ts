import sharp from 'sharp';
import { BaseSSRService } from '../loaders/index.js';
import type { OutputFormat, TransformOptions } from './index.js';

class SharpService extends BaseSSRService {
	async transform(inputBuffer: Buffer, transform: TransformOptions) {
		const sharpImage = sharp(inputBuffer, { failOnError: false, pages: -1 });

		// always call rotate to adjust for EXIF data orientation
		sharpImage.rotate();

		if (transform.width || transform.height) {
			const width = transform.width && Math.round(transform.width);
			const height = transform.height && Math.round(transform.height);
			sharpImage.resize(width, height);
		}

		// remove alpha channel and replace with background color if requested
		if (transform.background) {
			sharpImage.flatten({ background: transform.background });
		}

		if (transform.format) {
			sharpImage.toFormat(transform.format, { quality: transform.quality });
		}

		const { data, info } = await sharpImage.toBuffer({ resolveWithObject: true });

		return {
			data,
			format: info.format as OutputFormat,
		};
	}
}

const service = new SharpService();

export default service;
