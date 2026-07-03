import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { getFilenameWithoutExtension, getFileExtension } from './path.js';

describe('getFilenameWithoutExtension()', () => {
    it('Returns a file name with the extension stripped', () => {
        assert.strictEqual(getFilenameWithoutExtension('video.mp4'), 'video');
    });

    it('Returns a file name with the extension stripped when it has spaces', () => {
        assert.strictEqual(
            getFilenameWithoutExtension(' something or other.mp4'),
            ' something or other'
        );
    });

    it('Returns a file name with the extension stripped when it has periods', () => {
        assert.strictEqual(
            getFilenameWithoutExtension('test.video.another.why.mp4'),
            'test.video.another.why'
        );
    });

    it('Returns a file name when it has no extension', () => {
        assert.strictEqual(
            getFilenameWithoutExtension('test something '),
            'test something '
        );
    });
});

describe('getFileExtension()', () => {
    it('Returns a file extension', () => {
        assert.strictEqual(getFileExtension('video.mp4'), '.mp4');
    });

    it('Returns an empty string when there is no file extension', () => {
        assert.strictEqual(getFileExtension('test with no extension'), '');
    });
});
