using BEL;
using AutoMapper;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class CouponService
    {
        static CouponService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>().ReverseMap();
                cfg.CreateMap<Category, CategoryModel>().ReverseMap();
                cfg.CreateMap<Coupon, CouponModel>().ReverseMap();
                cfg.CreateMap<Token, TokenModel>().ReverseMap();
                cfg.CreateMap<User, UserModel>().ReverseMap();
                cfg.CreateMap<UserID, UserIdModel>().ReverseMap();
                cfg.CreateMap<Delivery, DeliveryModel>().ReverseMap();
                cfg.CreateMap<Transaction, TransactionModel>().ReverseMap();
                cfg.CreateMap<Product, ProductModel>().ReverseMap();
            });
        }

        public static bool Create(CouponModel b)
        {
            b.CreatedAt = DateTime.Now;
            b.ExpiredAt = b.CreatedAt.AddDays(1);
            var data = Mapper.Map<Coupon>(b);
            DataSupplier.CouponDataAccess().Add(data);
            return true;
        }

        public static void Edit(CouponModel b)
        {
            var data = Mapper.Map<Coupon>(b);
            DataSupplier.CouponDataAccess().Edit(data);
        }

        public static bool Delete(string id)
        {
            DataSupplier.CouponDataAccess().Delete(id);
            return true;
        }

        public static List<CouponModel> Get()
        {
            var data = Mapper.Map<List<CouponModel>>(DataSupplier.CouponDataAccess().Get());
            return data;
        }
        public static CouponModel Get(string id)
        {
            var data = Mapper.Map<CouponModel>(DataSupplier.CouponDataAccess().Get(id));
            return data;
        }
    }
}
