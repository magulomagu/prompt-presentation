// フロントエンドのAPIクライアント
// Vercelのサーバーレス関数を呼び出すように更新

class ApiClient {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  }

  // OpenAI APIを使用してプレゼンテーションを生成
  async generateWithOpenAI(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/openai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate presentation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating presentation with OpenAI:', error);
      throw error;
    }
  }

  // Gemini APIを使用してプレゼンテーションを生成
  async generateWithGemini(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/gemini-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate presentation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating presentation with Gemini:', error);
      throw error;
    }
  }

  // APIキーの検証
  async validateApiKey(apiKey, model) {
    try {
      const response = await fetch(`${this.baseUrl}/validate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error validating API key:', error);
      return { valid: false, error: error.message };
    }
  }
}

export default new ApiClient();
