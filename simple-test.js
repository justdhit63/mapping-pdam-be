// Test direct endpoint access
const adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AcGRhbS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjU1MTU4NzMsImV4cCI6MTcyNTUxOTQ3M30.example';

console.log('Testing endpoint with fake token...');

// Test with curl equivalent
import { spawn } from 'child_process';

const curl = spawn('curl', [
    '-X', 'GET',
    'http://localhost:3001/api/pelanggan/admin/available-users',
    '-H', 'Content-Type: application/json',
    '-v'
]);

curl.stdout.on('data', (data) => {
    console.log('stdout:', data.toString());
});

curl.stderr.on('data', (data) => {
    console.log('stderr:', data.toString());
});

curl.on('close', (code) => {
    console.log('curl exited with code:', code);
});
