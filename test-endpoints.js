import fetch from 'node-fetch';

async function testEndpoints() {
    const baseURL = 'http://localhost:3001';
    
    try {
        console.log('Testing available-users endpoint...');
        
        // First, login as admin to get token
        const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@pdam.com',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✓ Login successful, got token');
        
        // Test available-users endpoint
        const usersResponse = await fetch(`${baseURL}/api/pelanggan/admin/available-users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`Available-users endpoint status: ${usersResponse.status}`);
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            console.log('✓ Available users:', users.length);
            users.forEach(user => {
                console.log(`  - ${user.full_name || user.email} (${user.total_pelanggan} pelanggan)`);
            });
        } else {
            const error = await usersResponse.text();
            console.log('❌ Error response:', error);
        }
        
        // Test other admin endpoints
        console.log('\nTesting other admin endpoints...');
        
        const statsResponse = await fetch(`${baseURL}/api/pelanggan/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`Stats endpoint status: ${statsResponse.status}`);
        
        const allResponse = await fetch(`${baseURL}/api/pelanggan/admin/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`All pelanggan endpoint status: ${allResponse.status}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testEndpoints();
