from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # MPC 계산 등
    result = run_mpc(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, threaded=True) 


# framework code

# const axios = require('axios');
# const http = require('http');
# const https = require('https');

# // 연결 재사용 설정
# const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });

# const client = axios.create({
#   baseURL: 'http://localhost:5000',
#   httpAgent,
#   timeout: 5000
# });

# // 배치 호출 (여러 요청 동시 처리)
# async function batchPredict(dataArray) {
#   const promises = dataArray.map(data => 
#     client.post('/predict', data)
#   );
#   return Promise.all(promises);
# }