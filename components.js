const buttonComponentContent = `
import { FC } from "react";
import {
    ArrowDownTrayIcon,
    ArrowDownOnSquareStackIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowUturnDownIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/20/solid";

interface ButtonProps {
    /** The type of the button */
    type: "button" | "submit" | "reset";
    /** Whether the button is disabled */
    disabled: boolean;
    /** The onClick handler for the button */
    onClick?: () => void;
    /** The children to render inside the button */
    children: string;
    /** Additional CSS classes for the button */
    className?: string;
    /** The type of the button, which determines its appearance */
    buttonType?: "default" | "edit" | "add" | "reset" | "save" | "submit" | "delete" | "signIn";
}

/**
 * \`Button\` is a reusable button component with several predefined styles.
 *
 * It accepts several props:
 * - \`type\`: a string that specifies the type of the button. It should be "button", "submit", or "reset".
 * - \`disabled\`: a boolean that determines whether the button is disabled.
 * - \`onClick\`: a function that is called when the button is clicked.
 * - \`children\`: a string that is rendered inside the button.
 * - \`className\`: a string that specifies additional CSS classes for the button.
 * - \`buttonType\`: a string that determines the appearance of the button. It should be "default", "edit", "add", "reset", "save", "submit", "delete", or "signIn".
 *
 * Example usage:
 *
 * \`\`\`jsx
 * <Button type="button" disabled={false} onClick={handleClick} buttonType="edit">
 *   Edit
 * </Button>
 * \`\`\`
 */
const buttonStyles = {
    default: {
        enabled: "text-white bg-gray-600 hover:bg-gray-500",
        disabled: "bg-gray-400 cursor-not-allowed",
        icon: null,
    },
    edit: {
        enabled: "text-white bg-yellow-600 hover:bg-yellow-500",
        disabled: "bg-yellow-400 cursor-not-allowed",
        icon: <PencilIcon className="h-5 w-5" />,
    },
    add: {
        enabled: "text-white bg-green-600 hover:bg-green-500",
        disabled: "bg-green-400 cursor-not-allowed",
        icon: <PlusIcon className="h-5 w-5" />,
    },
    reset: {
        enabled: "text-white bg-blue-600 hover:bg-blue-500",
        disabled: "bg-blue-400 cursor-not-allowed",
        icon: <ArrowUturnDownIcon className="h-5 w-5" />,
    },
    save: {
        enabled: "text-white bg-indigo-600 hover:bg-indigo-500",
        disabled: "bg-indigo-400 cursor-not-allowed",
        icon: <ArrowDownOnSquareStackIcon className="h-5 w-5" />,
    },
    submit: {
        enabled: "text-white bg-green-600 hover:bg-green-500",
        disabled: "bg-green-400 cursor-not-allowed",
        icon: <ArrowDownTrayIcon className="h-5 w-5" />,
    },
    delete: {
        enabled: "text-white bg-red-500 hover:bg-red-700",
        disabled: "bg-red-400 cursor-not-allowed",
        icon: <TrashIcon className="h-5 w-5" />,
    },
    signIn: {
        enabled:
            "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700",
        disabled:
            "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium cursor-not-allowed bg-gray-400",
        icon: <ArrowLeftOnRectangleIcon className="h-5 w-5" />,
    },
};

const Button: FC<ButtonProps> = ({
    type,
    disabled,
    onClick,
    children,
    className = "",
    buttonType = "default",
}) => {
    const baseClasses = "flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium";
    const currentStyle = buttonStyles[buttonType];

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={\`\${baseClasses} \${disabled ? currentStyle.disabled : currentStyle.enabled} \${className}\`}
        >
            <span className="flex items-center justify-center space-x-2">
                {currentStyle.icon && <span className="w-5">{currentStyle.icon}</span>}
                <span>{children}</span>
            </span>
        </button>
    );
};

export default Button;
`;

const featureSliceContent = `
import { createSlice, createAsyncThunk, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import api from '../../utils/api/api';

interface User {
  id: number;
  name: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

interface LoginCredentials {
  userid: string;
  password: string;
  company: string;
}

interface ErrorResponse {
  data: string;
}


export const login = createAsyncThunk<User, LoginCredentials>(
  'auth/login',
  async ({ userid, password, company }, { rejectWithValue }) => {
    try {
      const response = await api.post<User>('/login', { userid, password, company });
      return response;
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        return rejectWithValue((err as { response: ErrorResponse }).response.data);
      }
      return rejectWithValue('An error occurred.');
    }
  }
);

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  error: null,
  status: 'idle',
}

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutSuccess(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
        state.status = 'succeeded';
      })
      .addCase(login.rejected, (state, action: PayloadAction<unknown, string, any, SerializedError>) => {
        state.isLoggedIn = false;
        state.user = null;
        state.error = action.error.message ?? 'An error occurred.';
        state.status = 'failed';
      });
  },
});


// Reducer
export default authSlice.reducer;

// Actions
export const { logoutSuccess } = authSlice.actions;

// Selector
export const selectAuth = (state: RootState) => state.auth;
`;

// Initialize a new store.ts file
const storeContent = `
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
`;

module.exports = {
  buttonComponentContent,
  featureSliceContent,
  storeContent,
};
