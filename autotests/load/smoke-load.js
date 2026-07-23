import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:4174';

export const options = {
  vus: Number(__ENV.K6_VUS || 3),
  duration: __ENV.K6_DURATION || '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  for (const path of ['/index.html', '/vk.html', '/privacy.html']) {
    const response = http.get(`${baseUrl}${path}`);
    check(response, {
      [`${path} returns 200`]: (res) => res.status === 200,
    });
  }
  sleep(1);
}
