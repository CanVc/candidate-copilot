"""Disposable PTY only. Never connect to the invoking terminal."""
import os
import pty
import select
import subprocess
import sys
import termios
import time

master, slave = pty.openpty()
proc = subprocess.Popen(['/bin/sh', sys.argv[1]], stdin=slave, stderr=slave,
                        stdout=subprocess.PIPE, env={'PATH': sys.argv[2] + ':/usr/bin:/bin'})
try:
    output = bytearray()
    end = time.monotonic() + 5
    while b'press Enter to stop: ' not in output:
        assert select.select([master], [], [], max(0, end - time.monotonic()))[0]
        output.extend(os.read(master, 65536))
    os.write(master, b'a' * 33)
    time.sleep(0.15)
    assert proc.poll() is None and not termios.tcgetattr(slave)[3] & termios.ECHO
    os.write(master, b'SYNTHETIC_HIDDEN_TAIL\r')
    stdout, _ = proc.communicate(timeout=3)
    assert proc.returncode == 1 and b'"status":"stopped"' in stdout
    while select.select([master], [], [], 0)[0]:
        output.extend(os.read(master, 65536))
    assert b'SYNTHETIC_HIDDEN_TAIL' not in output and b'aaaaa' not in output
    assert termios.tcgetattr(slave)[3] & termios.ECHO
finally:
    proc.kill()
    proc.wait()
    os.close(master)
    os.close(slave)
