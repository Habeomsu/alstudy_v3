from flask import Flask, request, jsonify
import subprocess
import os
import tempfile
import json

app = Flask(__name__)

@app.route('/grade', methods=['POST'])
def grade_code():
    try:
        print("Received request")  # 요청 수신 로그
        print("Request method:", request.method)  # 요청 메서드 로그
        print("Request headers:", request.headers)  # 요청 헤더 로그

        if 'code' not in request.files:
            return jsonify({"error": "No code file provided"}), 400

        test_cases = request.form.get('test_cases')
        if not test_cases:
            return jsonify({"error": "No test cases provided"}), 400

        # JSON 문자열을 파싱
        try:
            test_cases = json.loads(test_cases)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format for test cases"}), 400

        code_file = request.files['code']  # 제출된 코드 파일

        # 임시 코드 파일 생성
        with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as temp_code_file:
            code_file.save(temp_code_file.name)  # 업로드된 코드 파일 저장
            code_file_path = temp_code_file.name

        error_messages = []  # 오류 메시지 리스트

        # 각 테스트 케이스 실행
        for test_case in test_cases:
            input_data = test_case['input']
            expected_output = test_case['expected_output'].strip()

            # 입력을 임시 파일에 저장
            with tempfile.NamedTemporaryFile(delete=False) as input_file:
                input_file.write(input_data.encode())
                input_file_path = input_file.name

            # 코드 실행
            try:
                result = subprocess.run(
                    ['python', code_file_path],
                    stdin=open(input_file_path, 'r'),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=5  # 5초 제한
                )

                output = result.stdout.strip()  # 양쪽 끝의 공백 및 개행 제거
                error_message = result.stderr.strip()

                # 예측된 결과와 실제 출력 비교
                print(f"Expected Output: '{expected_output}'")
                print(f"Actual Output: '{output}'")

                if result.returncode != 0:
                    error_messages.append({"input": input_data, "error": error_message})
                    continue  # 다음 테스트 케이스로 이동

                if output != expected_output:  # 양쪽 끝의 공백 및 개행 제거 후 비교
                    error_messages.append({"input": input_data, "error": "Output does not match expected."})
                    continue  # 다음 테스트 케이스로 이동

            except subprocess.TimeoutExpired:
                error_messages.append({"input": input_data, "error": "Timeout"})
                continue  # 다음 테스트 케이스로 이동
            except Exception as e:
                error_messages.append({"input": input_data, "error": str(e)})
                continue  # 다음 테스트 케이스로 이동
            finally:
                os.remove(input_file_path)  # 임시 입력 파일 삭제

        os.remove(code_file_path)  # 임시 코드 파일 삭제
        
        if error_messages:
            return jsonify({"success": False, "errors": error_messages}), 200
        else:
            return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # 포트 번호 확인
