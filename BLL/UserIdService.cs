using AutoMapper;
using BEL;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class UserIdService
    {
        static UserIdService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>();
                cfg.CreateMap<BuyerModel, Buyer>();
                cfg.CreateMap<Category, CategoryModel>();
                cfg.CreateMap<CategoryModel, Category>();
                cfg.CreateMap<Coupon, CouponModel>();
                cfg.CreateMap<CouponModel, Coupon>();
                cfg.CreateMap<Token, TokenModel>();
                cfg.CreateMap<TokenModel, Token>();
                cfg.CreateMap<User, UserModel>();
                cfg.CreateMap<UserModel, User>();
                cfg.CreateMap<UserID, UserIdModel>();
                cfg.CreateMap<UserIdModel, UserID>();
                cfg.CreateMap<Delivery, DeliveryModel>();
                cfg.CreateMap<DeliveryModel, Delivery>();
                cfg.CreateMap<Transaction, TransactionModel>();
                cfg.CreateMap<TransactionModel, Transaction>();
                cfg.CreateMap<Product, ProductModel>();
                cfg.CreateMap<ProductModel, Product>();
            });
        }



        public static void Increment(User user)
        {
            
            if (user.AccType == "Buyer")
            {
                var data = DataSupplier.UserIdDataAccess().Get(2);
                data.LastID = data.LastID + 1;
                DataSupplier.UserIdDataAccess().Edit(data);
            }
            else if (user.AccType == "Seller")
            {
                var data = DataSupplier.UserIdDataAccess().Get(3);
                data.LastID = data.LastID + 1;
                DataSupplier.UserIdDataAccess().Edit(data);
            }
            else if (user.AccType == "Delivery Man")
            {
                var data = DataSupplier.UserIdDataAccess().Get(4);
                data.LastID = data.LastID + 1;
                DataSupplier.UserIdDataAccess().Edit(data);
            }


        }


        public static List<UserIdModel> Get()
        {
            var data = Mapper.Map<List<UserIdModel>>(DataSupplier.UserIdDataAccess().Get());
            return data;
        }
        public static UserIdModel Get(int id)
        {
            var data = Mapper.Map<UserIdModel>(DataSupplier.UserIdDataAccess().Get(id));
            return data;
        }

    }
}
