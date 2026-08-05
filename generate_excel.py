import pandas as pd

# Usage Data
users_per_day = 25
mins_per_user_per_day = 20
days_per_month = 30
total_mins_per_month = users_per_day * mins_per_user_per_day * days_per_month
total_hours_per_month = total_mins_per_month / 60

# Tokens Estimation
words_per_min = 150
total_words = total_mins_per_month * words_per_min
tokens_per_word = 1.33
total_input_tokens = int(total_words * tokens_per_word)
# 500 words output per 20 min session
total_sessions = users_per_day * days_per_month
total_output_words = total_sessions * 500
total_output_tokens = int(total_output_words * tokens_per_word)

# Costs
data = [
    {
        "Component": "Speech-to-Text",
        "Provider": "AssemblyAI",
        "Model / Tier": "Nano Tier (Universal-2)",
        "Metric": "Per Hour",
        "Rate ($)": 0.15,
        "Estimated Usage": f"{total_hours_per_month} hours",
        "Monthly Cost ($)": round(total_hours_per_month * 0.15, 2)
    },
    {
        "Component": "Speech-to-Text",
        "Provider": "AssemblyAI",
        "Model / Tier": "Pro Tier (Universal-3.5 Pro)",
        "Metric": "Per Hour",
        "Rate ($)": 0.21,
        "Estimated Usage": f"{total_hours_per_month} hours",
        "Monthly Cost ($)": round(total_hours_per_month * 0.21, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "OpenAI",
        "Model / Tier": "GPT-4o-mini",
        "Metric": "Input (per 1M tokens)",
        "Rate ($)": 0.15,
        "Estimated Usage": f"{total_input_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_input_tokens / 1e6) * 0.15, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "OpenAI",
        "Model / Tier": "GPT-4o-mini",
        "Metric": "Output (per 1M tokens)",
        "Rate ($)": 0.60,
        "Estimated Usage": f"{total_output_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_output_tokens / 1e6) * 0.60, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "OpenAI",
        "Model / Tier": "GPT-4o",
        "Metric": "Input (per 1M tokens)",
        "Rate ($)": 2.50,
        "Estimated Usage": f"{total_input_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_input_tokens / 1e6) * 2.50, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "OpenAI",
        "Model / Tier": "GPT-4o",
        "Metric": "Output (per 1M tokens)",
        "Rate ($)": 10.00,
        "Estimated Usage": f"{total_output_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_output_tokens / 1e6) * 10.00, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "Anthropic",
        "Model / Tier": "Claude 3.5 Haiku",
        "Metric": "Input (per 1M tokens)",
        "Rate ($)": 0.80,
        "Estimated Usage": f"{total_input_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_input_tokens / 1e6) * 0.80, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "Anthropic",
        "Model / Tier": "Claude 3.5 Haiku",
        "Metric": "Output (per 1M tokens)",
        "Rate ($)": 4.00,
        "Estimated Usage": f"{total_output_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_output_tokens / 1e6) * 4.00, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "Anthropic",
        "Model / Tier": "Claude 3.5 Sonnet",
        "Metric": "Input (per 1M tokens)",
        "Rate ($)": 3.00,
        "Estimated Usage": f"{total_input_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_input_tokens / 1e6) * 3.00, 2)
    },
    {
        "Component": "Analysis (LLM)",
        "Provider": "Anthropic",
        "Model / Tier": "Claude 3.5 Sonnet",
        "Metric": "Output (per 1M tokens)",
        "Rate ($)": 15.00,
        "Estimated Usage": f"{total_output_tokens / 1e6:.1f}M tokens",
        "Monthly Cost ($)": round((total_output_tokens / 1e6) * 15.00, 2)
    },
]

df_details = pd.DataFrame(data)

summary_data = [
    {
        "Setup Combination": "Budget: AssemblyAI Nano + GPT-4o-mini",
        "Total Monthly Cost ($)": 37.50 + 0.45 + 0.30
    },
    {
        "Setup Combination": "Mid-tier: AssemblyAI Nano + Claude 3.5 Haiku",
        "Total Monthly Cost ($)": 37.50 + 2.39 + 1.99
    },
    {
        "Setup Combination": "Premium: AssemblyAI Pro + GPT-4o",
        "Total Monthly Cost ($)": 52.50 + 7.48 + 4.98
    },
    {
        "Setup Combination": "Premium: AssemblyAI Pro + Claude 3.5 Sonnet",
        "Total Monthly Cost ($)": 52.50 + 8.97 + 7.48
    }
]

df_summary = pd.DataFrame(summary_data)

writer = pd.ExcelWriter('/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/Speech_Analysis_Cost_Estimation.xlsx', engine='openpyxl')
df_details.to_excel(writer, sheet_name='Detailed Costs', index=False)
df_summary.to_excel(writer, sheet_name='Summary', index=False)

# Auto-adjust columns width
for sheet in writer.sheets.values():
    for column in sheet.columns:
        max_length = 0
        column = [cell for cell in column]
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(cell.value)
            except:
                pass
        adjusted_width = (max_length + 2)
        sheet.column_dimensions[column[0].column_letter].width = adjusted_width

writer.close()
