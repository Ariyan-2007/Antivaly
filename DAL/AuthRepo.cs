using System;
using System.Linq;

namespace DAL
{
    public class AuthRepo : IAuth
    {
        private readonly AntivalyEntities db;

        public AuthRepo(AntivalyEntities dbContext)
        {
            this.db = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public Token Authenticate(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user), "User cannot be null.");
            }

            Token token = null;
            var u = db.Users.FirstOrDefault(e => e.UID == user.UID && e.Password == user.Password);
            if (u != null)
            {
                var g = Guid.NewGuid().ToString();

                token = new Token()
                {
                    UserID = u.UID,
                    AccStatus = u.AccStatus,
                    AccessToken = g,
                    CreatedAt = DateTime.Now
                };

                db.Tokens.Add(token);
                db.SaveChanges();
            }

            return token;
        }

        public bool IsAuthenticated(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                throw new ArgumentNullException(nameof(token), "Token cannot be null or empty.");
            }

            try
            {
                // Check if db is initialized
                if (db == null)
                {
                    throw new InvalidOperationException("Database context is not initialized.");
                }

                // Check if Tokens is initialized
                if (db.Tokens == null)
                {
                    throw new InvalidOperationException("Tokens set is not initialized.");
                }

                var ac_token = db.Tokens.FirstOrDefault(e => e.AccessToken.Equals(token) && e.ExpiredAt == null);
                return ac_token != null;
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Error while checking token: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                return false;
            }
        }

        public bool Logout(string id)
        {
            var data = db.Tokens.FirstOrDefault(e => e.UserID == id);
            if (data != null)
            {
                db.Tokens.Remove(data);
                db.SaveChanges();
                return true;
            }
            return false;
        }
    }
}
