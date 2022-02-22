<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Exception;

class AuthController extends Controller
{
    //
    public function login(Request $request){
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            //Auth::logoutOtherDevices($request('password'));

            return redirect('/app/inicio');
        }

        return back()->withErrors([
            'email' => 'Error en los datos proporcionados',
        ]);
    }

    public function apilogin(Request $request)
    {
        try {
            $request->validate([
            'email' => 'email|required',
            'password' => 'required'
            ]);
            $credentials = request(['email', 'password']);
            if (!Auth::attempt($credentials)) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Unauthorized'
            ]);
            }
            $user = User::where('email', $request->email)->first();
            if ( ! Hash::check($request->password, $user->password, [])) {
            throw new \Exception('Error in Login');
            }
            $user->tokens()->delete();
            $tokenResult = $user->createToken('authToken')->plainTextToken;
            // var_dump($tokenResult);
            // dd($user->tokens()->first()->plainTextToken);
            return response()->json([
            'status_code' => 200,
            'access_token' => $tokenResult,
            'token_type' => 'Bearer',
            'support_id' => Auth::id(),
            'user_role' => $user->role // Need this to bring authorization
            ]);
        } catch (Exception $error) {
            return response()->json([
            'status_code' => 500,
            'message' => 'Error in Login',
            'error' => $error->getMessage(),
            ]);
        }
    }

    public function logout(Request $request)
    {
        return redirect('/app')->with(Auth::logout());
    }
}

