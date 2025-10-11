import fs from 'fs';
import path from 'path';

const queue = [];
let running = false;

async function runTask(task) {
  try {
    if (task.type === 'process-evidence') {
      const { filePath, evidenceId, EvidenceModel } = task.payload;

      // try to generate a thumbnail if sharp is available
      try {
        const sharp = await import('sharp');
        const thumbDir = path.join(process.cwd(), 'uploads', 'evidence', 'thumbs');
        fs.mkdirSync(thumbDir, { recursive: true });
        const filename = path.basename(filePath);
        const thumbPath = path.join(thumbDir, `thumb-${filename}`);
        await sharp.default(filePath).resize({ width: 400 }).toFile(thumbPath);
        // update Evidence document with thumbnail path (best-effort)
        await EvidenceModel.findByIdAndUpdate(evidenceId, { thumbnail: `/uploads/evidence/thumbs/thumb-${filename}` });
      } catch (e) {
        // sharp not available or failed — ignore
      }

      // simple status update: mark pending -> verified
      try {
        await EvidenceModel.findByIdAndUpdate(evidenceId, { status: 'verified' });
      } catch (e) {}
    }
  } catch (err) {
    console.error('processing queue task failed', err);
  }
}

async function worker() {
  if (running) return;
  running = true;
  while (queue.length > 0) {
    const t = queue.shift();
    await runTask(t);
  }
  running = false;
}

export function enqueue(task) {
  queue.push(task);
  worker().catch((e) => console.error('queue worker error', e));
}

export default { enqueue };
